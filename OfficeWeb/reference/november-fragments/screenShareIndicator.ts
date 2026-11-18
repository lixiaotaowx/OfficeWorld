  let result: T | undefined;\
  try {\
    // Read the current persisted choice for every new capture, including each meeting.\
    const list = window.officeDesktop?.displays;\
    if (list) {\
      const displays = await list();\
      if (!displays.some(display => display.selected)) throw Error('设置里保存的屏幕当前不可用，请先选择可用屏幕');\
    }\
    result = await capture();\
