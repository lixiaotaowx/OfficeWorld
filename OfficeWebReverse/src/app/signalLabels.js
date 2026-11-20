const SIGNAL_LABELS = {
  unknown: '等信号数据',
  lost: '断开了',
  poor: '信号弱',
  good: '信号好',
  excellent: '信号很好',
};

export const getSignalLabel = quality => SIGNAL_LABELS[quality];

export function getMeetingConnectionLabel({ connection, quality }) {
  if (connection === 'inactive') return '没有在开会';
  if (connection === 'disconnected') return '断开了';
  if (connection !== 'connected') return '正在连会议…';
  return getSignalLabel(quality);
}
