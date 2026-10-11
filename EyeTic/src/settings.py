import json
from pathlib import Path
D=Path(__file__).resolve().parent.parent/'data'; S=D/'settings.json'; T=D/'stats.json'
def load(p,default):
 D.mkdir(exist_ok=True)
 if not p.exists(): p.write_text(json.dumps(default,indent=2)); return default.copy()
 try:
  x=default.copy(); x.update(json.loads(p.read_text())); return x
 except: return default.copy()
def save(p,x): D.mkdir(exist_ok=True); p.write_text(json.dumps(x,indent=2))
def settings(): return load(S,{'difficulty':'Medium','dwell':1.15,'preview':True})
def stats(): return load(T,{'wins':0,'losses':0,'draws':0})
__all__ = ['settings', 'stats', 'save', 'S', 'T']
