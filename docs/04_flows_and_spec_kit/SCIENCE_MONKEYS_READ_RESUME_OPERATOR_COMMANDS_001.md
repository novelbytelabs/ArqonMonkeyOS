# Science Monkeys Read/Resume Operator Commands 001

Status:
REQUIRES_HUMAN_REVIEW
development diagnostic only
NOT SEALED-TEST CERTIFIED
not promotable

## Purpose

Make the new read/resume surface the first operator workflow for Science Monkey GPTs.

This document is operator guidance only. It does not authorize new backend powers, queue mutation, certification, promotion, deployment, production readiness, or autonomous Science operation.

## Morning Resume Workflow

Use this order before any write command:

1. `/whoami`
2. `/capabilities`
3. `/show`
4. `/resume`
5. `/next`
6. `/stop-conditions`
7. `/open-artifact` only when a specific governed artifact body is needed

## Command Meanings

| Command | Purpose | Backend route |
|---|---|---|
| `/whoami` | Confirm authenticated role and denied authorities | `GET /v1/whoami` |
| `/capabilities` | Confirm read/write permissions and forbidden routes | `GET /v1/capabilities` |
| `/show` | List active/recent/blocked flows by friendly name | `GET /v1/show` |
| `/resume` | Load the most relevant flow resume packet | `GET /v1/resume` |
| `/resume flow="..."` | Resume a specific flow by id/name | `GET /v1/flows/{flow_ref}/resume` |
| `/flow-history` | Inspect flow history and decisions | `GET /v1/flows/{flow_ref}/history` |
| `/list-artifacts` | List artifact metadata without bodies | `GET /v1/flows/{flow_ref}/artifacts` |
| `/latest` | Show latest artifact summaries | `GET /v1/flows/{flow_ref}/latest` |
| `/next` | Show next allowed action; does not execute it | `GET /v1/flows/{flow_ref}/next` |
| `/stop-conditions` | Show stop/quarantine triggers | `GET /v1/flows/{flow_ref}/stop-conditions` |
| `/open-artifact` | Read one governed artifact body by artifact id | `GET /v1/artifacts/{artifact_id}` |

## Required Stop Behavior

Stop before writing if:

- role identity is wrong
- capability output grants unexpected write authority
- `/resume` returns unknown or ambiguous state
- `/next` recommends a role other than the current role
- `/stop-conditions` returns active blocker/quarantine state
- artifact body read returns `ARTIFACT_CONTENT_POLICY_DENIED`
- artifact metadata returns `UNKNOWN_UNSAFE_PATH`
- source artifacts are missing
- a route appears to grant Human or Science Executor authority to a GPT

## Truth Boundary

Raw GPT output is not evidence.

Routed artifacts are governed records, not scientific truth.

No harness = No truth.

Read/resume commands restore context. They do not certify findings, approve deployment, promote artifacts, or authorize autonomous operation.
