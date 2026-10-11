import random
LINES=[(0,1,2),(3,4,5),(6,7,8),(0,3,6),(1,4,7),(2,5,8),(0,4,8),(2,4,6)]
def winner(b):
    for a,c,d in LINES:
        if b[a] and b[a]==b[c]==b[d]: return b[a]
    return 'DRAW' if all(b) else None
def empty(b): return [i for i,x in enumerate(b) if not x]
def minimax(b,maxi):
    r=winner(b)
    if r=='O': return 10
    if r=='X': return -10
    if r=='DRAW': return 0
    vals=[]
    for i in empty(b):
        b[i]='O'; vals.append(minimax(b,False)); b[i]=''
    return max(vals) if maxi else min(vals)
def best(b):
    moves=[]; score=-999
    for i in empty(b):
        b[i]='O'; s=minimax(b,False); b[i]=''
        if s>score: score=s; moves=[i]
        elif s==score: moves.append(i)
    return random.choice(moves) if moves else None
def medium(b):
    for mark in ('O','X'):
        for i in empty(b):
            b[i]=mark
            if winner(b)==mark: b[i]=''; return i
            b[i]=''
    return 4 if 4 in empty(b) else random.choice(empty(b))
def choose(b,d): return random.choice(empty(b)) if d=='Easy' else (best(b) if d=='Hard' else medium(b))
