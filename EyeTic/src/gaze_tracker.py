import cv2,numpy as np
import mediapipe as mp
def _open_camera():
 cap = cv2.VideoCapture(0, cv2.CAP_DSHOW)
 if not cap.isOpened():
  cap = cv2.VideoCapture(0)
 return cap
class GazeTracker:
 def __init__(self):
  self.cap=_open_camera(); self.ok=self.cap.isOpened(); self.streaming=False; self.last=(.5,.5); self.sx=.5; self.sy=.5; self._last_try=0
  self.mesh=mp.solutions.face_mesh.FaceMesh(max_num_faces=1,refine_landmarks=True,min_detection_confidence=.5,min_tracking_confidence=.5) if self.ok else None
 def reconnect(self):
  if not self.ok or not self.cap.isOpened():
   import time
   now=time.time()
   if now - self._last_try > 2.0:
    self._last_try = now
    if self.cap: self.cap.release()
    self.cap = _open_camera()
    self.ok = self.cap.isOpened()
    if self.ok and not self.mesh:
     self.mesh = mp.solutions.face_mesh.FaceMesh(max_num_faces=1,refine_landmarks=True,min_detection_confidence=.5,min_tracking_confidence=.5)
  return self.ok
 def read(self):
  if not self.ok and not self.reconnect():
   self.streaming=False; return None,None,False
  ok,f=self.cap.read()
  if not ok:
   self.streaming=False; return None,None,False
  self.streaming=True
  f=cv2.flip(f,1); r=self.mesh.process(cv2.cvtColor(f,cv2.COLOR_BGR2RGB))
  if not r.multi_face_landmarks:return f,None,False
  lm=r.multi_face_landmarks[0].landmark
  try:
   lx=np.mean([lm[i].x for i in [468,469,470,471,472]]); rx=np.mean([lm[i].x for i in [473,474,475,476,477]])
   ly=np.mean([lm[i].y for i in [468,469,470,471,472]]); ry=np.mean([lm[i].y for i in [473,474,475,476,477]])
   x=np.clip(.5+((lx+rx)/2-.5)*2.4,0,1); y=np.clip(.5+((ly+ry)/2-.5)*2.4,0,1)
   self.sx=.18*x+.82*self.sx; self.sy=.18*y+.82*self.sy
   self.last=(self.sx,self.sy)
   h, w = f.shape[:2]
   cv2.circle(f, (int(lm[468].x * w), int(lm[468].y * h)), 4, (0, 255, 0), -1)
   cv2.circle(f, (int(lm[473].x * w), int(lm[473].y * h)), 4, (0, 255, 0), -1)
  except: return f,None,False
  return f,self.last,True
 def release(self):
  if self.mesh:self.mesh.close()
  if self.cap:self.cap.release()
  cv2.destroyAllWindows()
