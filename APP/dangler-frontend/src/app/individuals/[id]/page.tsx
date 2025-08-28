"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Group } from "@visx/group";
import { Line, Circle } from "@visx/shape";
import { scaleTime } from "@visx/scale";
import { Tooltip, useTooltip, TooltipWithBounds } from "@visx/tooltip";

interface Event {
  id: number;
  title: string;
  description?: string;
  event_date: string;
}

interface Individual {
  id: number;
  name: string;
  category: string;
  birth_date: string;
  death_date?: string;
  description: string;
  profile_image?: string; // ✅ add this
}

export default function IndividualPage() {
  const params = useParams();
  const id = params.id;

  const [individual, setIndividual] = useState<Individual | null>(null);
  const [events, setEvents] = useState<Event[]>([]);

  // Tooltip
  const { tooltipData, tooltipLeft, tooltipTop, showTooltip, hideTooltip } =
    useTooltip<Event>();

  useEffect(() => {
    fetch(`http://localhost:5000/individuals/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setIndividual(data.individual);
        setEvents(
          data.events.sort(
            (a: Event, b: Event) =>
              new Date(a.event_date).getTime() -
              new Date(b.event_date).getTime()
          )
        );
      })
      .catch((err) => console.error(err));
  }, [id]);

  if (!individual) return <p className="p-8">Loading...</p>;

  // Visx timeline setup
  const width = 120;
  const height = 500;
  const margin = { top: 20, bottom: 20 };
  const timeScale = scaleTime({
    domain: [
      new Date(individual.birth_date),
      individual.death_date ? new Date(individual.death_date) : new Date(),
    ],
    range: [margin.top, height - margin.bottom],
  });

  return (
    <div className="p-8 flex gap-12">
      {/* Left side: individual info */}
      <div className="w-1/3">
        {individual.profile_image && (
          <img
            src={`http://localhost:5000${individual.profile_image}`}
            alt={`${individual.name} profile`}
            className="w-32 h-32 rounded-full mb-4"
          />
        )}
        <h1 className="text-3xl font-bold mb-4">{individual.name}</h1>
        <p className="text-gray-700">{individual.description}</p>
        <p className="text-gray-500 mt-1">
          {individual.birth_date?.slice(0, 10)} –{" "}
          {individual.death_date ? individual.death_date.slice(0, 10) : "Present"}
        </p>
      </div>

      {/* Rope timeline */}
      <div className="relative">
        <svg width={width} height={height}>
          <Line
            from={{ x: width / 2, y: margin.top }}
            to={{ x: width / 2, y: height - margin.bottom }}
            stroke="black"
            strokeWidth={2}
          />
          <Group>
            {events.map((ev) => {
              const y = timeScale(new Date(ev.event_date)) || 0;
              return (
                <Circle
                  key={ev.id}
                  cx={width / 2}
                  cy={y}
                  r={6}
                  fill="blue" // ✅ always blue now (no media check)
                  onMouseMove={(e) =>
                    showTooltip({
                      tooltipData: ev,
                      tooltipLeft: e.clientX,
                      tooltipTop: e.clientY,
                    })
                  }
                  onMouseLeave={hideTooltip}
                />
              );
            })}
          </Group>
        </svg>

        {tooltipData && (
          <TooltipWithBounds top={tooltipTop} left={tooltipLeft}>
            <div className="p-2">
              <p className="font-bold">{tooltipData.title}</p>
              {tooltipData.description && (
                <p className="text-sm">{tooltipData.description}</p>
              )}
              <p className="text-gray-500 text-xs">
                {tooltipData.event_date?.slice(0, 10)}
              </p>
            </div>
          </TooltipWithBounds>
        )}
      </div>
    </div>
  );
}
