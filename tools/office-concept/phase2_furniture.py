import bpy,sys
sys.path.insert(0,r'G:/C/wendang/ChatGPT/youxi/tools/office-concept')
from primitives import *
from furniture import *
names={'cream':'Ivory porcelain','wood':'Pale natural oak','sage':'Muted sage upholstery','frame':'Warm graphite','dark':'Graphite rubber','green':'Foliage olive','terra':'Muted terracotta','screen':'Display background','ui0':'UI mint','ui1':'UI blue','ui2':'UI white','glass':'Clear glass','rug':'Sage woven rug'}
m={k:bpy.data.materials[v] for k,v in names.items()}
desk_island('Island_A',-3,-2,m)
desk_island('Island_B',3,-2,m)
# Six-seat glass meeting room.
box('Meeting / oval table',(3.8,4.2,.75),(3.1,1.25,.09),m['wood'],.45)
for x in [2.8,4.8]:cylinder('Meeting / pedestal',(x,4.2,.36),.18,.72,m['wood'])
for x in [2.8,3.8,4.8]:
 chair('Meeting chair north',x,5.1,0,m)
 chair('Meeting chair south',x,3.3,math.pi,m)
box('Meeting / presentation display',(3.8,6.36,1.9),(2.05,.07,1.05),m['frame'],.035)
box('Meeting / display surface',(3.8,6.31,1.9),(1.95,.014,.95),m['screen'],.02)
plant('Meeting tabletop plant',3.8,4.2,.3,m)
box('Meeting / credenza',(5.3,6.05,.42),(1.85,.6,.84),m['wood'],.025)
# One manager workstation with two visitor seats, separate from the eight desks.
box('Manager / desk',(8.8,4.2,.76),(2.25,.95,.09),m['wood'],.035)
for x in [7.75,9.85]:box('Manager / desk support',(x,4.2,.37),(.12,.85,.72),m['wood'])
monitor('Manager',8.65,4.2,1,m)
chair('Manager chair',8.65,5.18,0,m)
for x in [8.0,9.35]:chair('Manager visitor chair',x,3.25,math.pi,m)
box('Manager / rug',(8.7,4.25,.012),(3.65,3.25,.018),m['rug'],.1)
box('Manager / low cabinet',(9.8,6.07,.42),(1.8,.65,.84),m['wood'],.025)
plant('Manager tall plant',7.1,5.8,1.65,m)
# Coffee counter at rear centre, preserving an access aisle to both rooms.
box('Coffee / cabinets',(-2.3,5.9,.46),(3.8,.75,.92),m['wood'],.025)
box('Coffee / countertop',(-2.3,5.9,.95),(3.9,.84,.055),m['cream'],.025)
box('Coffee / peninsula',(-3.9,4.9,.88),(1.7,.72,.10),m['wood'],.025)
box('Coffee / peninsula support',(-4.65,4.9,.44),(.11,.65,.85),m['wood'])
for x in [-4.2,-3.5]:
 cylinder('Coffee / stool cushion',(x,4.25,.62),.22,.07,m['sage'])
 for dx in [-.14,.14]:bar('Coffee / stool leg',(x+dx,4.25,.58),(x+dx*1.3,4.25,.04),.02,m['frame'])
box('Coffee machine',(-1.3,5.9,1.25),(.52,.48,.54),m['frame'],.04)
box('Coffee machine panel',(-1.3,5.65,1.36),(.28,.014,.14),m['screen'],.01)
cylinder('Coffee cup',(-1.3,5.60,1.05),.05,.09,m['cream'])
box('Coffee / wall shelf',(-2.3,6.25,1.9),(3.6,.34,.05),m['wood'])
plant('Coffee shelf plant',-3.25,6.17,.35,m)
# Correct tabletop plant height; plant helper is floor based.
for obj in list(bpy.context.scene.objects):
 if obj.name.startswith(('Island_A desk plant','Island_B desk plant','Meeting tabletop plant')):obj.location.z+=.81
 if obj.name.startswith('Coffee shelf plant'):obj.location.z+=1.95
bpy.ops.wm.save_as_mainfile(filepath=bpy.data.filepath)
print('PHASE 2: eight shared workstations, meeting furniture, manager office and coffee bar saved.')
