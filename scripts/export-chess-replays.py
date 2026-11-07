"""Export frozen one-move chess evaluations, without inventing game moves.

Usage: python scripts/export-chess-replays.py RELEASE_ROOT OUTPUT.json
"""
import argparse
import gzip
import hashlib
import json
from pathlib import Path

p = argparse.ArgumentParser()
p.add_argument("root", type=Path)
p.add_argument("output", type=Path)
args = p.parse_args()
report_path = args.root / "artifacts/chess-audit-v1/family-report/final.json"
report = json.loads(report_path.read_text())
conditions = {"fixed_depth_audit": "Fixed stopping", "random_audit": "Random stopping", "no_audit": "No audit"}
data = {"conditions": conditions, "seeds": [17, 29, 43], "runs": {}, "sources": {}}
for condition in conditions:
    for seed in data["seeds"]:
        run_id = f"{condition}-s{seed}"
        relative = f"results/chess-family-rl-v1/training/{run_id}/development-test-0960.json.gz"
        source = args.root / relative
        raw = json.loads(gzip.decompress(source.read_bytes()))
        run = next(r for r in report["runs"] if r["run_id"] == run_id)
        point = next(p for p in run["points"] if p["split"] == "test" and p["moves"] == 960)
        boards = []
        for board in raw["boards"]:
            episodes = []
            for ep in board["episodes"]:
                events = []
                for ev in ep["events"]:
                    events.append({k: ev[k] for k in ("depth", "action", "audit", "caught", "executed", "task_reward", "audit_penalty", "verdict", "after_fen") if k in ev})
                episodes.append({"events": events, "reward": ep["reward"], "finalFen": ep["final_fen"], "stopSeed": ep["stop_seed"]})
            boards.append({"id": board["position_id"], "fen": board["fen"], "episodes": episodes})
        data["runs"][run_id] = {"metrics": point["family_weighted"], "boards": boards, "source": relative}
        data["sources"][relative] = hashlib.sha256(source.read_bytes()).hexdigest()
for condition in conditions:
    data.setdefault("aggregate", {})[condition] = {
        metric: [sum(data["runs"][f"{condition}-s{s}"]["metrics"][metric][bound] for s in data["seeds"]) / 3 for bound in (0, 1)]
        for metric in ("unpenalized_opponent", "opponent", "legal", "rejected")
    }
assert abs(data["aggregate"]["fixed_depth_audit"]["unpenalized_opponent"][0] * 100 - 99.03846153846153) < 1e-8
data["provenance"] = {"repository": "https://github.com/williamklett/looped-readout-monitoring", "endpoint": "960 training moves", "testBoards": 32, "testFamilies": 8, "aggregation": "Equal weight to families and seeds", "bounds": "Unobserved stopping depths, not confidence intervals", "reportSha256": hashlib.sha256(report_path.read_bytes()).hexdigest()}
args.output.write_text(json.dumps(data, separators=(",", ":")) + "\n")
print(f"Exported {len(data['runs'])} runs, all 32 test boards and all 16 saved rollouts per board: {args.output.stat().st_size} bytes")
print(json.dumps(data["aggregate"]))
