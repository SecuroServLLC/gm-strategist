import React from 'react';
import { useParams } from 'react-router-dom';
import TerminalScreen from '@/components/sys/TerminalScreen';

export default function SysTerminal() {
  const { deviceId } = useParams();
  return <TerminalScreen key={deviceId} deviceId={deviceId} />;
}