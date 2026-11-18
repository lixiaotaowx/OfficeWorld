  delta:THREE.Vector3;amount:number;\
  rawDelta:THREE.Vector3;appliedDelta:THREE.Vector3;rawAmount:number;appliedAmount:number;\
      input:'',delta:new THREE.Vector3(),amount:mode==='scale'?1:0};\
      input:'',delta:new THREE.Vector3(),amount:mode==='scale'?1:0,\
      rawDelta:new THREE.Vector3(),appliedDelta:new THREE.Vector3(),\
      rawAmount:mode==='scale'?1:0,appliedAmount:mode==='scale'?1:0};\
    }else s.amount=Math.round((event.clientX-s.pointer.x-(event.clientY-s.pointer.y))/60)*90;\
    }else s.amount=(event.clientX-s.pointer.x-(event.clientY-s.pointer.y))/60*90;\
    // Incremental precision keeps the object continuous when Shift is pressed\
    // or released halfway through a move, rather than jumping back to 10%.\
    const precision=event.shiftKey?.1:1;\
    const rawDelta=s.delta.clone(),rawAmount=s.amount;\
    s.delta.copy(s.appliedDelta).addScaledVector(rawDelta.clone().sub(s.rawDelta),precision);\
    s.amount=s.appliedAmount+(rawAmount-s.rawAmount)*precision;\
    s.rawDelta.copy(rawDelta);s.appliedDelta.copy(s.delta);\
    s.rawAmount=rawAmount;s.appliedAmount=s.amount;\
    if(s.mode==='translate' && s.input && s.constraint?.plane){\
      this.port.hint('数字移动请选择单一轴；平面移动请使用鼠标');return true;\
    }\
      amount=Number(s.input);\
      if(s.mode==='translate') {\
        delta.set(0,0,0);delta[s.constraint?.axis || 'x']=amount;\
        if(s.constraint?.local)delta.applyQuaternion(partQuaternion(s.parts[0]));\
        if(s.constraint?.plane) {\
          this.port.hint('数字移动请选择单一轴；平面移动请使用鼠标');return;\
        const basis=s.constraint?.local?partQuaternion(s.parts[0]):new THREE.Quaternion();\
        delta.applyQuaternion(basis.clone().invert());\
        if(s.constraint && !s.constraint.plane){delta.set(0,0,0);delta[s.constraint.axis]=1;}\
        else {\
          if(s.constraint)delta[s.constraint.axis]=0;\
          if(delta.lengthSq()<1e-8){delta.set(0,0,0);delta[s.constraint?.axis==='x'?'z':'x']=1;}\
        }\
        delta.normalize().multiplyScalar(amount).applyQuaternion(basis);\
      }\
