import { useState } from 'react';
import { BellIcon } from './icons';
import { enableNotifications } from './officeNotifications';
export default function NotificationSetting() {
  const [permission, setPermission] = useState('Notification' in window ? Notification.permission : 'unsupported');
  return <div className="notification-setting">
    <button onClick={async () => {
      await enableNotifications();
      setPermission('Notification' in window ? Notification.permission : 'unsupported');
    }}><BellIcon />{permission === 'granted' ? '系统通知已开启' : '开启来电与消息通知'}</button>
    <p>{permission === 'denied' ? '系统通知被禁用，请在浏览器或系统的通知设置中允许 Office World。' :
      '来电、会议邀请和新消息提示一声；自己的消息与历史补收保持安静。'}</p>
  </div>;
}
