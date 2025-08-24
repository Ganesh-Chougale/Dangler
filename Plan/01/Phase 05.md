# **Dangler – Phase 5 Documentation**

## **Phase 5: Frontend – Display & Basic Visualization**

### **Objective**

* Display **Individuals list** with category, description, and lifespan.
* Show **Individual detail page** with events represented as a **vertical timeline (rope)**.
* Integrate **Visx** for the timeline visualization.
* Add **tooltip/modals** to show event details on hover.
* Fetch all data from backend APIs (Phase 4).

---

## **1️⃣ Dependencies**

```bash
npm install @visx/shape @visx/group @visx/tooltip @visx/scale
```

* `@visx/shape` → For line and circle shapes
* `@visx/group` → Grouping elements in SVG
* `@visx/tooltip` → Tooltips for events
* `@visx/scale` → Scale time to vertical rope

---

## **2️⃣ File Structure**

```
src/
└── app/
    └── individuals/
        ├── page.tsx             <-- List of individuals
        └── [id]/page.tsx       <-- Individual detail with vertical timeline
```

---

## **3️⃣ Individuals List Page**

**File:** `src/app/individuals/page.tsx`

**Functionality:**

* Fetch all individuals from `GET /individuals`.
* Display each individual as a card with:

  * Name
  * Category
  * Description
  * Birth & death dates (or Present if alive)
* Click on a card → navigate to `/individuals/:id`

```tsx
"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

interface Individual {
  id: number;
  name: string;
  category: string;
  description: string;
  birth_date: string;
  death_date?: string | null;
}

export default function IndividualsPage() {
  const [individuals, setIndividuals] = useState<Individual[]>([]);

  useEffect(() => {
    fetch("http://localhost:5000/individuals")
      .then(res => res.json())
      .then(data => setIndividuals(data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Individuals</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {individuals.map(ind => (
          <Link key={ind.id} href={`/individuals/${ind.id}`} className="p-4 border rounded shadow hover:shadow-lg transition">
            <h2 className="font-semibold text-xl">{ind.name}</h2>
            <p className="text-gray-600">{ind.category}</p>
            <p className="text-gray-700 mt-2">{ind.description}</p>
            <p className="text-gray-500 text-sm mt-1">
              {ind.birth_date?.slice(0,10)} - {ind.death_date ? ind.death_date.slice(0,10) : "Present"}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
```

---

## **4️⃣ Individual Detail Page with Vertical Timeline**

**File:** `src/app/individuals/[id]/page.tsx`

**Functionality:**

* Fetch **individual info + events + tags** from `GET /individuals/:id`.
* Render **vertical rope** (life timeline) using Visx.
* Each **event = knot** → `Circle` on timeline.
* Hover on knot → show **tooltip with event title, description, date**.
* Handles **living individuals** (`death_date` null).

```tsx
"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Group } from "@visx/group";
import { Line, Circle } from "@visx/shape";
import { scaleTime } from "@visx/scale";
import { TooltipWithBounds, useTooltip } from "@visx/tooltip";

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
}

export default function IndividualPage() {
  const params = useParams();
  const id = params.id;

  const [individual, setIndividual] = useState<Individual | null>(null);
  const [events, setEvents] = useState<Event[]>([]);

  const { tooltipData, tooltipLeft, tooltipTop, showTooltip, hideTooltip } = useTooltip<Event>();

  useEffect(() => {
    fetch(`http://localhost:5000/individuals/${id}`)
      .then(res => res.json())
      .then(data => {
        setIndividual(data.individual);
        setEvents(data.events.sort((a: Event, b: Event) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime()));
      })
      .catch(err => console.error(err));
  }, [id]);

  if (!individual) return <p className="p-8">Loading...</p>;

  const width = 100;
  const height = 400;
  const margin = { top: 20, bottom: 20 };
  const timeScale = scaleTime({
    domain: [new Date(individual.birth_date), individual.death_date ? new Date(individual.death_date) : new Date()],
    range: [margin.top, height - margin.bottom]
  });

  return (
    <div className="p-8 flex gap-8">
      <div>
        <h1 className="text-3xl font-bold mb-4">{individual.name}</h1>
        <p className="text-gray-700">{individual.description}</p>
        <p className="text-gray-500 mt-1">
          {individual.birth_date?.slice(0,10)} - {individual.death_date ? individual.death_date.slice(0,10) : "Present"}
        </p>
      </div>

      <svg width={width} height={height}>
        <Line
          from={{ x: width / 2, y: margin.top }}
          to={{ x: width / 2, y: height - margin.bottom }}
          stroke="black"
          strokeWidth={2}
        />
        <Group>
          {events.map(ev => {
            const y = timeScale(new Date(ev.event_date)) || 0;
            return (
              <Circle
                key={ev.id}
                cx={width / 2}
                cy={y}
                r={6}
                fill="blue"
                onMouseMove={(e) => showTooltip({ tooltipData: ev, tooltipLeft: e.clientX, tooltipTop: e.clientY })}
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
            {tooltipData.description && <p className="text-sm">{tooltipData.description}</p>}
            <p className="text-gray-500 text-xs">{tooltipData.event_date?.slice(0,10)}</p>
          </div>
        </TooltipWithBounds>
      )}
    </div>
  );
}
```

---

## **5️⃣ Features Implemented**

1. **List page** (`/individuals`)

   * Fetch all individuals
   * Cards display name, category, description, lifespan
   * Click → navigate to detail

2. **Detail page** (`/individuals/:id`)

   * Fetch individual info + nested events + tags
   * Render **vertical rope** using Visx
   * Events = knots on rope
   * Tooltip on hover

3. **Responsive, simple Tailwind styling**

4. **Backend integration** (Phase 4 APIs) working

---

## **6️⃣ Testing**

1. Start backend (`node index.js`) → port 5000
2. Start frontend (`npm run dev`) → port 3000
3. Visit:

   * `http://localhost:3000/individuals` → list page
   * Click individual → `/individuals/:id` → vertical rope + events
4. Hover on event → tooltip displays event details