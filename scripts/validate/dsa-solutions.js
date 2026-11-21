import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';

const lessonsRoot = path.resolve('course/lessons');
if (!fs.existsSync(lessonsRoot)) {
  console.log('No DSA practice lessons found; validation passed.');
  process.exit(0);
}

const markdownFiles = fs.readdirSync(lessonsRoot, {recursive: true})
  .filter(file => file.endsWith('.md') && /^t11-\d{3}.*-practice-/.test(path.basename(file)));
const failures = [];
let validated = 0;

const requiredHeadings = [
  'Goals',
  'Problem statement',
  'Input constraints',
  'Examples with expected output',
  'Clarifying assumptions',
  'Progressive hints',
  'Complete C# solution',
  'Correctness argument',
  'Step-by-step dry run',
  'Time complexity',
  'Space complexity',
  'Edge-case tests',
  'Reflection questions',
];
const targetFramework = process.env.DSA_TARGET_FRAMEWORK ?? 'net11.0';

for (const relativeFile of markdownFiles) {
  const file = path.join(lessonsRoot, relativeFile);
  const text = fs.readFileSync(file, 'utf8');
  const missingHeadings = requiredHeadings.filter(heading => !new RegExp(`^#{1,6}\\s+${heading.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\$&')}\\s*$`, 'mi').test(text));
  if (missingHeadings.length) {
    failures.push(`${file}: missing required heading(s): ${missingHeadings.join(', ')}`);
    continue;
  }

  const solutions = [...text.matchAll(/```csharp\s+dsa-solution\s*\r?\n([\s\S]*?)```/g)];
  if (solutions.length !== 1) {
    failures.push(`${file}: expected exactly one fenced C# dsa-solution program, found ${solutions.length}`);
    continue;
  }

  const source = solutions[0][1].trim();
  if (!/throw\s+new\s+(?:InvalidOperationException|Exception|AssertionException)\b/.test(source)) {
    failures.push(`${file}: solution program must fail when a sample or edge-case assertion is false`);
    continue;
  }

  const temporaryDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'senior-academy-dsa-'));
  try {
    const dotnetHome = path.join(temporaryDirectory, '.dotnet-home');
    fs.mkdirSync(dotnetHome);
    fs.writeFileSync(path.join(temporaryDirectory, 'Solution.csproj'), [
      '<Project Sdk="Microsoft.NET.Sdk">',
      '  <PropertyGroup>',
      '    <OutputType>Exe</OutputType>',
      `    <TargetFramework>${targetFramework}</TargetFramework>`,
      '    <ImplicitUsings>enable</ImplicitUsings>',
      '    <Nullable>enable</Nullable>',
      '  </PropertyGroup>',
      '</Project>',
      '',
    ].join('\n'));
    fs.writeFileSync(path.join(temporaryDirectory, 'Program.cs'), source);
    const result = spawnSync('dotnet', ['run', '--project', path.join(temporaryDirectory, 'Solution.csproj'), '--configuration', 'Release'], {
      cwd: temporaryDirectory,
      encoding: 'utf8',
      timeout: 60000,
      maxBuffer: 1024 * 1024,
      env: {
        ...process.env,
        DOTNET_CLI_HOME: dotnetHome,
        DOTNET_SKIP_FIRST_TIME_EXPERIENCE: '1',
        DOTNET_CLI_TELEMETRY_OPTOUT: '1',
        NUGET_PACKAGES: path.join(temporaryDirectory, '.nuget', 'packages'),
      },
    });
    if (result.error) throw result.error;
    if (result.status !== 0) {
      const detail = `${result.stdout ?? ''}${result.stderr ?? ''}`.trim().slice(-3000);
      failures.push(`${file}: C# solution did not build and pass its assertions (exit ${result.status})\n${detail}`);
    } else {
      validated++;
      console.log(`C# solution built and assertions passed: ${relativeFile}`);
    }
  } catch (error) {
    failures.push(`${file}: ${error.message}`);
  } finally {
    const resolvedTemp = path.resolve(temporaryDirectory);
    const resolvedRoot = path.resolve(os.tmpdir()) + path.sep;
    if (!resolvedTemp.startsWith(resolvedRoot)) throw new Error(`Refusing to remove temporary path outside OS temp: ${resolvedTemp}`);
    fs.rmSync(resolvedTemp, {recursive: true, force: true, maxRetries: 10, retryDelay: 250});
  }
}

if (failures.length) {
  console.error(failures.join('\n\n'));
  console.error(`${failures.length} DSA solution(s) failed validation.`);
  process.exitCode = 1;
} else {
  console.log(`Validated ${validated} DSA C# solution(s).`);
}
