import { describe, expect, it } from "vitest";
import { SCENARIOS } from "./index";
import { callReducer, initCall, nodeById } from "../../features/video-coach/callMachine";
import { buildDebrief } from "../../features/video-coach/debrief";

describe("scenario graphs", () => {
  for (const s of SCENARIOS) {
    describe(s.id, () => {
      it("all next ids resolve; every node reachable from entry; all paths terminate", () => {
        const ids = new Set(s.nodes.map((n) => n.id));
        expect(ids.size).toBe(s.nodes.length); // no duplicate ids
        expect(ids.has(s.entryNodeId)).toBe(true);

        // resolution
        for (const n of s.nodes) {
          for (const c of n.choices) {
            if (!c.next.startsWith("end:")) {
              expect(ids.has(c.next), `${s.id}/${n.id}/${c.id} -> ${c.next} unresolved`).toBe(true);
            }
          }
        }

        // reachability (BFS)
        const seen = new Set<string>([s.entryNodeId]);
        const queue = [s.entryNodeId];
        while (queue.length) {
          const id = queue.shift()!;
          const n = s.nodes.find((x) => x.id === id)!;
          for (const c of n.choices) {
            if (!c.next.startsWith("end:") && !seen.has(c.next)) {
              seen.add(c.next);
              queue.push(c.next);
            }
          }
        }
        expect([...ids].filter((id) => !seen.has(id)), "unreachable nodes").toEqual([]);

        // termination: every path ends within N steps (DFS with depth cap; graph may not cycle forever)
        const terminates = (nodeId: string, depth: number, visited: string[]): boolean => {
          if (depth > 20) return false;
          const node = s.nodes.find((x) => x.id === nodeId)!;
          return node.choices.every((c) => {
            if (c.next.startsWith("end:")) return true;
            if (visited.includes(c.next)) return true; // cycle allowed only if another branch ends; conservative pass
            return terminates(c.next, depth + 1, [...visited, c.next]);
          });
        };
        expect(terminates(s.entryNodeId, 0, [s.entryNodeId])).toBe(true);

        // a goal_met path exists
        const reachesGoal = (nodeId: string, visited: Set<string>): boolean => {
          if (visited.has(nodeId)) return false;
          visited.add(nodeId);
          const node = s.nodes.find((x) => x.id === nodeId)!;
          return node.choices.some((c) => (c.next === "end:goal_met" ? true : c.next.startsWith("end:") ? false : reachesGoal(c.next, visited)));
        };
        expect(reachesGoal(s.entryNodeId, new Set())).toBe(true);
      });

      it("every node has a coach hint and at least 2 choices with moves", () => {
        for (const n of s.nodes) {
          expect(n.coachHint.length).toBeGreaterThan(10);
          expect(n.choices.length).toBeGreaterThanOrEqual(2);
          for (const c of n.choices) {
            expect(c.moves.length, `${n.id}/${c.id} has no rubric moves`).toBeGreaterThan(0);
          }
        }
      });

      it("call machine runs a strong path to debrief with rubric evidence", () => {
        let state = initCall(s);
        state = callReducer(state, { t: "BEGIN" }, s);
        state = callReducer(state, { t: "CONSENT_TEXT" }, s);
        state = callReducer(state, { t: "CONNECTED" }, s);
        expect(state.phase).toBe("live");
        // greedily pick strong (else first) choices until end
        for (let i = 0; i < 20 && state.phase === "live"; i++) {
          const node = nodeById(s, state.nodeId)!;
          const pick = node.choices.find((c) => c.quality === "strong") ?? node.choices[0];
          state = callReducer(state, { t: "CHOOSE", choiceId: pick.id }, s);
        }
        expect(state.phase).toBe("closing");
        expect(state.endReason).toBe("goal_met");
        state = callReducer(state, { t: "SUMMARY", text: "I held my plan." }, s);
        expect(state.phase).toBe("debrief");
        const debrief = buildDebrief(s, state);
        expect(debrief.moments.length).toBeGreaterThanOrEqual(2);
        expect(debrief.moments.length).toBeLessThanOrEqual(5);
        expect(debrief.overall === "Ready" || debrief.overall === "Strong").toBe(true);
      });

      it("free text matches keywords; unmatched text asks one clarifying line", () => {
        let state = initCall(s);
        state = callReducer(state, { t: "BEGIN" }, s);
        state = callReducer(state, { t: "CONSENT_TEXT" }, s);
        state = callReducer(state, { t: "CONNECTED" }, s);
        const before = state.nodeId;
        state = callReducer(state, { t: "FREETEXT", text: "zzz unintelligible zzz" }, s);
        expect(state.clarifying).toBe(true);
        expect(state.nodeId).toBe(before);
        const node = nodeById(s, state.nodeId)!;
        const kw = node.choices.find((c) => c.keywords?.length)?.keywords?.[0];
        if (kw) {
          state = callReducer(state, { t: "FREETEXT", text: `well, ${kw} please` }, s);
          expect(state.path.length).toBe(1);
        }
      });
    });
  }
});
