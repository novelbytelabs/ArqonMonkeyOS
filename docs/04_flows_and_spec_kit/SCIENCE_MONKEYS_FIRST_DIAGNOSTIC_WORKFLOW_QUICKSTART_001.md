# Science Monkeys First Diagnostic Workflow Quickstart 001

Status:

REQUIRES_HUMAN_REVIEW  
development diagnostic only  
NOT SEALED-TEST CERTIFIED  
not promotable

## Purpose

This quickstart is the short version of the first diagnostic workflow tutorial.

It is for Option A: Human-Gated Manual Lane.

## Before You Start

Make sure you know the topic and what you want to understand.

Use a short flow name, such as:

```text
first-diagnostic-flow
```

Do not use this process for certification, deployment, production readiness, autonomous operation, or Human-share bypass.

## Step 1: Explorer

Open Arqon Zero Explorer AI.

Paste:

```text
/research name="first-diagnostic-flow" topic="YOUR TOPIC" objective="WHAT WE NEED TO UNDERSTAND"
```

Human review:

```text
Is this research artifact clear enough to support a hypothesis?
YES: continue.
NO: revise or stop.
```

## Step 2: Hypothesizer

Open Arqon Zero Hypothesizer AI.

Paste:

```text
/hypothesize flow="first-diagnostic-flow" research_artifact="RESEARCH ARTIFACT ID OR PATH" objective="THE CLAIM WE NEED TO TEST"
```

Human review:

```text
Is the hypothesis clear and falsifiable?
YES: continue.
NO: revise or stop.
```

## Step 3: Designer

Open Arqon Zero Designer AI.

Paste:

```text
/design-experiment flow="first-diagnostic-flow" hypothesis_artifact="HYPOTHESIS ARTIFACT ID OR PATH" objective="DESIGN A BOUNDED EXPERIMENT TO TEST THIS CLAIM"
```

Human review:

```text
Is the experiment bounded, executable, controlled, and auditable?
YES: continue.
NO: revise or stop.
```

## Step 4: Local Science Executor

Do not use a GPT for this step.

The local Science Executor runs the approved execution packet and produces:

```text
execution_report
evidence_manifest
command_log
raw_result_index
deviation_report
```

Human review:

```text
Is the evidence packet complete enough for audit?
YES: continue.
NO: repair or quarantine.
```

## Step 5: Science Auditor

Open Arqon Zero Science Auditor AI.

Paste:

```text
/audit-experiment flow="first-diagnostic-flow" evidence_packet="EXECUTOR EVIDENCE ARTIFACT IDS OR PATHS" objective="AUDIT PROTOCOL, EVIDENCE, CLAIMS, AND ROLE BOUNDARIES"
```

Human review:

```text
Does the audit support record, iterate, quarantine, share, or stop?
```

## Step 6: Record Finding If Appropriate

Use Science Auditor only if Human decides a finding record is appropriate.

```text
/record-finding flow="first-diagnostic-flow" audit_report="AUDIT REPORT ID OR PATH" finding_type="positive|negative|inconclusive|boundary"
```

## Always Remember

```text
Raw GPT output is not evidence.
No harness = No truth.
A routed artifact is a governed record, not proof.
Human retains official share and advancement authority.
Science Executor remains non-GPT/local only.
```
