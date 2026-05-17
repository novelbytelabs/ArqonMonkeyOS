# Science Monkeys First Diagnostic Workflow Tutorial 001

Status:

REQUIRES_HUMAN_REVIEW  
development diagnostic only  
NOT SEALED-TEST CERTIFIED  
not promotable

## Purpose

This tutorial explains how to use Science Monkeys from end to end in plain English.

It is for the first real diagnostic workflow trial under the active protocol:

```text
Option A: Human-Gated Manual Lane
```

That means the Human reviews each major phase before the workflow moves forward. The system is not autonomous. The GPTs do not decide that the work is true, complete, approved, certified, promotable, deployable, or production-ready.

This tutorial does not authorize certification, promotion, deployment, production-readiness claims, autonomous Science operation, Option C activation, assigning `HUMAN` authority to GPTs, assigning `SCIENCE_EXECUTOR_AI` authority to GPTs, bypassing Human-only `/v1/science/share`, treating raw GPT output as evidence, treating routed artifacts as scientific truth, or Code Monkeys handoff without separate Human approval.

## The Simple Idea

Science Monkeys is a Human-reviewed diagnostic workflow for doing early scientific investigation in a safer and more organized way.

The GPTs help create structured records. The records are useful because they keep the work organized. But the records are not proof by themselves. A routed artifact is a governed record, not proof that the claim is true.

The local Science Executor is where real execution happens. The Executor is not a GPT. It is the local execution path that produces command logs, raw outputs, evidence manifests, and deviation reports.

The Auditor checks whether the evidence supports the claim. The Auditor can also say that the evidence is weak, missing, negative, inconclusive, or should be quarantined.

The Human decides whether the workflow moves forward.

## The Main Rule

Keep this rule in mind for the whole workflow:

```text
Raw GPT output is not evidence.
No harness = No truth.
Artifact creation is not scientific truth.
```

A GPT can write a research dossier. That does not make the research true.

A GPT can write a hypothesis. That does not prove the hypothesis.

A GPT can design an experiment. That does not mean the experiment was run.

A local Executor can run commands and produce logs. That is where evidence starts to exist.

An Auditor can review evidence. That does not certify or deploy anything.

The Human remains in charge.

## The End-to-End Flow

The first diagnostic workflow follows this order:

```text
Explorer
→ Human review
→ Hypothesizer
→ Human review
→ Designer
→ Human review
→ local Science Executor
→ Human review
→ Science Auditor
→ Human decision
```

Do not skip the Human review steps. The Human gates are what keep the system from drifting into momentum bias.

Momentum bias means the workflow keeps moving just because the previous artifact exists. That is not allowed. The Human must decide whether the previous artifact is good enough to move forward.

## Step 1: Explorer

Start with Arqon Zero Explorer AI.

The Explorer's job is to gather research context. It can create a research dossier, source map, contradiction map, or open questions. It should help you understand what is known, what is uncertain, what claims conflict, and what still needs evidence.

Use a command like this:

```text
/research name="first-diagnostic-flow" topic="topic to investigate" objective="what we need to understand"
```

A good Explorer result should say what sources or claims matter, what is still uncertain, what contradictions exist, and what questions should be answered before forming a hypothesis.

After the Explorer creates the artifact, stop. The Human reviews it. If the research context is too weak, unclear, or unsupported, do not move forward. Ask the Explorer to improve the research artifact or quarantine the flow.

## Step 2: Hypothesizer

If the Human approves the research artifact for hypothesis drafting, move to Arqon Zero Hypothesizer AI.

The Hypothesizer's job is to turn the research context into a clear testable claim. A good hypothesis must be able to fail. If there is no way to disprove the claim, it is not ready for experiment design.

Use a command like this:

```text
/hypothesize flow="first-diagnostic-flow" research_artifact="research_dossier artifact id or path" objective="the specific claim we need to test"
```

A good Hypothesizer result should include the claim under test, the null hypothesis, expected observations, disconfirming observations, and possible alternative explanations.

After the Hypothesizer creates the artifact, stop. The Human reviews it. If the hypothesis is vague, unfalsifiable, too broad, or already overclaiming, do not move forward.

## Step 3: Designer

If the Human approves the hypothesis for experiment design, move to Arqon Zero Designer AI.

The Designer's job is to create the experiment plan. It defines what should be tested, what controls are needed, what metrics matter, and what evidence the local Science Executor must produce.

Use a command like this:

```text
/design-experiment flow="first-diagnostic-flow" hypothesis_artifact="hypothesis_card artifact id or path" objective="design a bounded experiment to test the hypothesis"
```

The Designer must not run commands. It must not produce command logs. It must not claim results. It must not certify anything.

The Designer must use only these canonical Executor artifact names:

```text
execution_report
evidence_manifest
command_log
raw_result_index
deviation_report
```

After the Designer creates the protocol or execution packet, stop. The Human reviews it. If the design is too vague, impossible to run, missing controls, missing metrics, or not auditable, do not move forward.

## Step 4: Local Science Executor

This is not a GPT step.

The local Science Executor runs the approved execution packet. This is where commands, logs, outputs, and deviations are created.

The Executor should produce:

```text
execution_report
evidence_manifest
command_log
raw_result_index
deviation_report
```

The Executor should preserve exact commands, timestamps, exit codes, inputs, outputs, result paths, checksums, environment information, failures, skipped steps, and deviations.

After local execution finishes, stop. The Human checks whether the evidence packet exists and is complete enough for audit. If logs are missing or outputs are unclear, do not ask the Auditor to pretend the evidence is strong.

## Step 5: Science Auditor

If the Human approves the evidence packet for audit, move to Arqon Zero Science Auditor AI.

The Auditor's job is to inspect the protocol, evidence, command logs, provenance, and claims. The Auditor should say what the evidence supports and what it does not support.

Use a command like this:

```text
/audit-experiment flow="first-diagnostic-flow" evidence_packet="execution evidence artifact ids or paths" objective="audit protocol, evidence, claims, and role boundaries"
```

A good audit should identify missing evidence, weak evidence, unsupported claims, role-boundary issues, and whether the result should be recorded, iterated, or quarantined.

The Auditor must not fabricate missing evidence. It must not run commands. It must not certify the result. It must not approve deployment or production use.

## Step 6: Human Decision

After the audit, the Human decides what happens next.

The Human may choose to iterate, quarantine, record a finding, create a Human-only share packet, or stop.

If the evidence is weak, the correct outcome may be negative or inconclusive. That is acceptable. In Science Monkeys, a clean negative or inconclusive result is better than a fake positive result.

If the Human wants to record a finding, use the Science Auditor only within its allowed route:

```text
/record-finding flow="first-diagnostic-flow" audit_report="audit_report artifact id or path" finding_type="positive|negative|inconclusive|boundary"
```

A finding record is not certification. A positive finding is still bounded and diagnostic. It does not approve production use.

## What Not To Do

Do not ask a GPT to execute experiments.

Do not ask a GPT to create command logs.

Do not ask a GPT to certify the result.

Do not treat a polished GPT answer as evidence.

Do not let Code Monkeys act on diagnostic science without a separate Human handoff approval.

Do not use `/v1/science/share` from a Science GPT. Official share authority is Human-only.

Do not activate Option C. Option C is future-only until separately planned, audited, and Human-approved.

## When To Stop

Stop and quarantine the workflow if any secret is exposed, any GPT tries to use another role's route, any GPT asks for Human or Executor authority, any evidence is missing but treated as present, any artifact claims certification or production readiness, or any raw GPT output is treated as evidence.

Quarantine does not mean failure in a bad sense. Quarantine means the system caught a risk before it became a false claim.

## Beginner Summary

Use Explorer to understand the topic.

Use Hypothesizer to make a claim testable.

Use Designer to plan the test.

Use the local Science Executor to run the test and create real evidence.

Use Science Auditor to check the evidence and claims.

Use Human judgment to decide what moves forward.

Keep every step diagnostic, Human-reviewed, and non-certifying.
