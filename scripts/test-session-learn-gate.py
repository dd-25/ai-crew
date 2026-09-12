import json, os, subprocess, tempfile, pathlib, shutil

HOOK = os.path.expanduser("~/.claude/hooks/session-learn.mjs")
STATE = pathlib.Path(os.path.expanduser("~/.claude/.learn-state"))


def user(text):
    return {"message": {"role": "user", "content": [{"type": "text", "text": text}]}}


def tool_result(text):
    return {"message": {"role": "user",
                        "content": [{"type": "tool_result", "content": text}]}}


def asst(text="ok"):
    return {"message": {"role": "assistant", "content": [{"type": "text", "text": text}]}}


CASES = {
    "long session, no correction": [user("add a helper for this")] + [asst()] * 10,
    "correction present": [user("no, don't commit every time")] + [asst()] * 10,
    "preference stated": [user("from now on always use tabs")] + [asst()] * 10,
    "correction but short session": [user("don't do that")] + [asst()] * 2,
    "signal only in system-reminder": [
        user("<system-reminder>Do not run destructive commands. Always verify.</system-reminder>\nadd a test")
    ] + [asst()] * 10,
    "signal only in tool output": [user("run it"), tool_result("error: do not use this API")] + [asst()] * 10,
}

EXPECT = {
    "long session, no correction": False,
    "correction present": True,
    "preference stated": True,
    "correction but short session": False,
    "signal only in system-reminder": False,
    "signal only in tool output": False,
}

tmp = tempfile.mkdtemp()
fails = 0
for i, (name, lines) in enumerate(CASES.items()):
    tp = os.path.join(tmp, f"t{i}.jsonl")
    with open(tp, "w", encoding="utf-8") as f:
        for l in lines:
            f.write(json.dumps(l) + "\n")
    sid = f"gatetest{i}"
    payload = json.dumps({"session_id": sid, "transcript_path": tp})
    r = subprocess.run(["node", HOOK], input=payload, capture_output=True,
                       text=True, encoding="utf-8")
    fired = "decision" in (r.stdout or "")
    ok = fired == EXPECT[name]
    if not ok:
        fails += 1
    print(f"  {'PASS' if ok else 'FAIL'}  {name:34} fired={fired!s:5} expected={EXPECT[name]!s:5} exit={r.returncode}")
    m = STATE / f"{sid}.done"
    if m.exists():
        m.unlink()

shutil.rmtree(tmp, ignore_errors=True)
print(f"\n{len(CASES) - fails}/{len(CASES)} passed")
