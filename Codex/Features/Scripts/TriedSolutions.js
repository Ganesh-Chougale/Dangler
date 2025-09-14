const fs = require("fs");
const path = require("path");

function main() {
  const args = process.argv.slice(2);
  const codebaseFile = args[0];
  const inputFile = path.join(__dirname, "..", "..", "Input", "Instructions.txt");
  const outputDir = path.join(__dirname, "ScriptOutput");
  fs.mkdirSync(outputDir, { recursive: true });

  if (!codebaseFile || !fs.existsSync(codebaseFile)) {
    console.error("❌ Codebase file not found for FinalInstruction.");
    process.exit(1);
  }

  const instructions = fs.existsSync(inputFile)
    ? fs.readFileSync(inputFile, "utf-8")
    : "_No instructions provided._";

  const codebaseContent = fs.readFileSync(codebaseFile, "utf-8");

  const result =
    `Instruction:\n${instructions}\n\n---\n\n` +
    `Context Preview (first 500 chars):\n${codebaseContent.slice(0, 500)}...`;

  fs.writeFileSync(path.join(outputDir, "RunFinalInstruction.md"), result);
  console.log("✅ RunFinalInstruction.md generated from Input/Instructions.txt");
}

main();
