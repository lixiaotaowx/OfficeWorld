    element.addEventListener('pointermove',this.move,true);\
    window.addEventListener('pointermove',this.move,true);\
    this.element.removeEventListener('pointermove',this.move,true);\
    window.removeEventListener('pointermove',this.move,true);\
