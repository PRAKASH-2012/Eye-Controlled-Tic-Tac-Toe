import pygame,time,cv2
from .gaze_tracker import GazeTracker
from .ai import choose,winner
from .settings import settings,stats,save,S,T
W,H=1100,700; CY=(70,220,255); WH=(240,245,255); Y=(255,215,70); G=(80,230,150); R=(245,70,90)
class EyeTicGame:
 def __init__(self):
  pygame.init(); self.s=pygame.display.set_mode((W,H)); pygame.display.set_caption('EyeTic - Eye Controlled Tic-Tac-Toe'); self.clock=pygame.time.Clock(); self.f=pygame.font.SysFont('arial',28,bold=True); self.big=pygame.font.SysFont('arial',52,bold=True); self.tr=GazeTracker(); self.set=settings(); self.st=stats(); self.state='menu'; self.mi=0; self.si=0; self.items=['START GAME','HOW TO PLAY','SETTINGS','EXIT']; self.preview=None; self.gaze_pt=None
 def txt(self,t,p,font=None,c=WH,center=True):
  z=(font or self.f).render(str(t),True,c); r=z.get_rect(center=p) if center else z.get_rect(topleft=p); self.s.blit(z,r)
 def bg(self):
  self.s.fill((7,11,22));
  for x in range(0,W,50): pygame.draw.line(self.s,(16,27,45),(x,0),(x,H))
  for y in range(0,H,50): pygame.draw.line(self.s,(16,27,45),(0,y),(W,y))
 def start(self): self.b=['']*9; self.sel=4; self.gc=None; self.gs=None; self.turn=True; self.result=None; self.state='play'; self.ai_at=0
 def cell(self,i): return pygame.Rect(330+(i%3)*145,145+(i//3)*145,132,132)
 def gaze(self,g):
  if not g:return None
  return min(2,int(g[1]*3))*3+min(2,int(g[0]*3))
 def player(self,i):
  if not self.turn or self.b[i]:return
  self.b[i]='X'; self.turn=False; self.gc=None; self.gs=None; r=winner(self.b)
  if r:self.end(r)
  else:self.ai_at=time.time()+.5
 def end(self,r):
  self.result=r; self.state='result'; self.st['wins' if r=='X' else 'losses' if r=='O' else 'draws']+=1; save(T,self.st)
 def camera(self):
  f,g,ok=self.tr.read(); self.preview=f; self.gaze_pt=g
  if ok and g and self.turn:
   c=self.gaze(g)
   if c!=self.gc:self.gc=c; self.gs=time.time()
   elif not self.b[c] and time.time()-self.gs>=self.set['dwell']:self.player(c)
  return ok
 def draw_board(self):
  for i in range(9):
   r=self.cell(i); active=i==self.gc and self.turn or i==self.sel; pygame.draw.rect(self.s,(35,65,82) if active else (18,27,43),r,border_radius=14); pygame.draw.rect(self.s,CY if active else (65,85,110),r,2,border_radius=14)
   if self.b[i]=='X': pygame.draw.line(self.s,CY,(r.x+30,r.y+30),(r.right-30,r.bottom-30),7); pygame.draw.line(self.s,CY,(r.right-30,r.y+30),(r.x+30,r.bottom-30),7)
   elif self.b[i]=='O': pygame.draw.circle(self.s,Y,r.center,43,7)
   if i==self.gc and self.turn and not self.b[i] and self.gs:
    p=min(1,(time.time()-self.gs)/self.set['dwell']); pygame.draw.arc(self.s,G,r.inflate(-10,-10),-1.57,-1.57+6.28*p,6)
 def playdraw(self,ok):
  self.bg(); self.txt('EYETIC',(W//2,55),self.big,CY); self.draw_board(); self.txt('YOUR TURN - LOOK AT A CELL' if self.turn else 'COMPUTER THINKING...',(W//2,620),self.f,G if self.turn else Y); self.txt('Face not detected - Mouse / Arrow Keys + Enter fallback enabled' if not ok else 'Keep your gaze on a cell to select it',(W//2,660),pygame.font.SysFont('arial',16),R if not ok else (150,170,195))
  if self.preview is not None and self.set['preview']:
   q=cv2.resize(self.preview,(220,165)); q=cv2.cvtColor(q,cv2.COLOR_BGR2RGB).swapaxes(0,1); im=pygame.surfarray.make_surface(q); self.s.blit(im,(855,500)); pygame.draw.rect(self.s,CY,(855,500,220,165),2)
 def menu(self):
  self.bg(); self.txt('EYETIC',(W//2,120),self.big,CY); self.txt('PLAY WITH YOUR EYES',(W//2,175),self.f)
  for i,x in enumerate(self.items):
   r=pygame.Rect(W//2-170,245+i*62,340,48); pygame.draw.rect(self.s,(45,110,140) if i==self.mi else (27,37,55),r,border_radius=10); pygame.draw.rect(self.s,CY,r,2,border_radius=10); self.txt(x,r.center,self.f)
 def how(self):
  self.bg(); self.txt('HOW TO PLAY',(W//2,90),self.big,CY); lines=['Sit 40-70 cm from the webcam.','Look toward one of the 9 cells.','Hold your gaze until the green ring completes.','You are X; computer is O.','Easy = random, Medium = tactical, Hard = minimax.','Fallback: Mouse click or Arrow Keys + Enter.','ESC = Back to Menu.']; y=175
  for x in lines:self.txt(x,(W//2,y),pygame.font.SysFont('arial',21)); y+=50
  back_rect=pygame.Rect(W//2-100,560,200,44); pygame.draw.rect(self.s,(27,37,55),back_rect,border_radius=8); pygame.draw.rect(self.s,CY,back_rect,2,border_radius=8); self.txt('BACK',back_rect.center,self.f)
 def settings_draw(self):
  self.bg(); self.txt('SETTINGS',(W//2,90),self.big,CY)
  opts=[
   ('AI Difficulty', self.set['difficulty']),
   ('Gaze Dwell Time', f"{self.set['dwell']:.1f}s"),
   ('Camera Preview', 'ON' if self.set['preview'] else 'OFF'),
   ('BACK', '')
  ]
  for i,(k,v) in enumerate(opts):
   r=pygame.Rect(W//2-220,190+i*75,440,54); pygame.draw.rect(self.s,(45,110,140) if i==self.si else (27,37,55),r,border_radius=10); pygame.draw.rect(self.s,CY,r,2,border_radius=10)
   text=f"{k}: {v}" if v else k
   self.txt(text,r.center,self.f)
  self.txt('Use Left/Right or Enter to adjust, ESC to save & exit',(W//2,540),pygame.font.SysFont('arial',18),(150,170,195))
 def toggle_setting(self, idx, forward=True):
  diffs=['Easy','Medium','Hard']; dwells=[0.8, 1.0, 1.15, 1.5, 2.0]
  if idx==0:
   cur=diffs.index(self.set.get('difficulty','Medium')) if self.set.get('difficulty') in diffs else 1
   self.set['difficulty']=diffs[(cur+(1 if forward else -1))%len(diffs)]
  elif idx==1:
   cur=dwells.index(self.set.get('dwell',1.15)) if self.set.get('dwell') in dwells else 2
   self.set['dwell']=dwells[(cur+(1 if forward else -1))%len(dwells)]
  elif idx==2:
   self.set['preview']=not self.set.get('preview',True)
  elif idx==3:
   save(S,self.set); self.state='menu'
  save(S,self.set)
 def resultdraw(self):
  self.bg(); c=G if self.result=='X' else R if self.result=='O' else Y; self.txt('YOU WIN!' if self.result=='X' else 'AI WINS' if self.result=='O' else 'DRAW',(W//2,200),self.big,c); self.txt(f"Wins {self.st['wins']}  Losses {self.st['losses']}  Draws {self.st['draws']}",(W//2,300),self.f); self.txt('ENTER / Click = Play Again    ESC = Main Menu',(W//2,450),self.f)
 def events(self):
  for e in pygame.event.get():
   if e.type==pygame.QUIT:self.running=False
   elif e.type==pygame.MOUSEBUTTONDOWN and e.button==1:
    mx,my=e.pos
    if self.state=='menu':
     for i in range(len(self.items)):
      r=pygame.Rect(W//2-170,245+i*62,340,48)
      if r.collidepoint(mx,my):
       if i==0:self.start()
       elif i==1:self.state='how'
       elif i==2:self.state='settings'; self.si=0
       elif i==3:self.running=False
    elif self.state=='how':
     if pygame.Rect(W//2-100,560,200,44).collidepoint(mx,my):self.state='menu'
    elif self.state=='settings':
     for i in range(4):
      r=pygame.Rect(W//2-220,190+i*75,440,54)
      if r.collidepoint(mx,my):self.si=i; self.toggle_setting(i,forward=True)
    elif self.state=='play':
     for i in range(9):
      if self.cell(i).collidepoint(mx,my):self.player(i)
    elif self.state=='result':
     self.start()
   elif e.type==pygame.KEYDOWN:
    k=e.key
    if self.state=='menu':
     if k in (pygame.K_UP,pygame.K_w):self.mi=(self.mi-1)%4
     elif k in (pygame.K_DOWN,pygame.K_s):self.mi=(self.mi+1)%4
     elif k in (pygame.K_RETURN,pygame.K_SPACE):
      if self.mi==0:self.start()
      elif self.mi==1:self.state='how'
      elif self.mi==2:self.state='settings'; self.si=0
      elif self.mi==3:self.running=False
    elif self.state=='how' and k in (pygame.K_ESCAPE,pygame.K_RETURN):self.state='menu'
    elif self.state=='settings':
     if k in (pygame.K_UP,pygame.K_w):self.si=(self.si-1)%4
     elif k in (pygame.K_DOWN,pygame.K_s):self.si=(self.si+1)%4
     elif k in (pygame.K_LEFT,pygame.K_a):self.toggle_setting(self.si,forward=False)
     elif k in (pygame.K_RIGHT,pygame.K_d,pygame.K_RETURN,pygame.K_SPACE):self.toggle_setting(self.si,forward=True)
     elif k==pygame.K_ESCAPE:save(S,self.set); self.state='menu'
    elif self.state=='play':
     if k==pygame.K_ESCAPE:self.state='menu'
     elif k==pygame.K_r:self.start()
     elif k==pygame.K_LEFT:self.sel=(self.sel-1)%9
     elif k==pygame.K_RIGHT:self.sel=(self.sel+1)%9
     elif k==pygame.K_UP:self.sel=(self.sel-3)%9
     elif k==pygame.K_DOWN:self.sel=(self.sel+3)%9
     elif k in (pygame.K_RETURN,pygame.K_SPACE):self.player(self.sel)
    elif self.state=='result':
     if k in (pygame.K_RETURN,pygame.K_SPACE):self.start()
     elif k==pygame.K_ESCAPE:self.state='menu'
 def run(self):
  self.running=True
  while self.running:
   self.clock.tick(60); self.events()
   if self.state=='menu':self.menu()
   elif self.state=='how':self.how()
   elif self.state=='settings':self.settings_draw()
   elif self.state=='play':
    ok=self.camera()
    if not self.turn and time.time()>=self.ai_at and not self.result:
     m=choose(self.b,self.set['difficulty'])
     if m is not None:self.b[m]='O'
     r=winner(self.b); self.end(r) if r else setattr(self,'turn',True)
    self.playdraw(ok)
   elif self.state=='result':self.resultdraw()
   pygame.display.flip()
  self.tr.release(); pygame.quit()
