// src/app/admin/components/settings/SettingsModal.tsx
"use client";

import { useState } from 'react';
import {
  BsBell,
  BsExclamationTriangle,
  BsGear,
  BsToggleOff,
  BsToggleOn,
  BsX
} from 'react-icons/bs';
import { useNotificationContext } from '../../contexts/NotificationContext';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SettingsTabProps {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
  badge?: number;
}

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
  icon?: React.ReactNode;
  activeIcon?: React.ReactNode;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  checked,
  onChange,
  label,
  description,
  icon,
  activeIcon
}) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-3">
        {icon && (
          <span className={`text-gray-400 ${checked && 'text-blue-500'}`}>
            {checked ? activeIcon || icon : icon}
          </span>
        )}
        <div>
          <p className="text-gray-900">{label}</p>
          {description && (
            <p className="text-sm text-gray-500">{description}</p>
          )}
        </div>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className="flex items-center focus:outline-none"
        role="switch"
        aria-checked={checked}
      >
        {checked ? (
          <BsToggleOn className="h-6 w-6 text-blue-600" />
        ) : (
          <BsToggleOff className="h-6 w-6 text-gray-400" />
        )}
      </button>
    </div>
  );
};

const SettingsTab: React.FC<SettingsTabProps> = ({
  icon,
  label,
  isActive,
  onClick,
  badge
}) => {
  return (
    <button
      onClick={onClick}
      className={`relative flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-md ${
        isActive
          ? 'bg-blue-100 text-blue-700'
          : 'text-gray-600 hover:bg-gray-100'
      }`}
    >
      {icon}
      <span>{label}</span>
      {badge !== undefined && badge > 0 && (
        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          {badge}
        </span>
      )}
    </button>
  );
};

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState('notifications');
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  const {
    notificationPermission,
    requestNotificationPermission,
    isNotificationSupported
  } = useNotificationContext();

  if (!isOpen) return null;

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900">
          Powiadomienia systemowe
        </h3>
        <p className="text-sm text-gray-500">
          Zarządzaj sposobem otrzymywania powiadomień z systemu.
        </p>
      </div>

      <div className="space-y-4">
        {isNotificationSupported ? (
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">
                Powiadomienia przeglądarki
              </p>
              <p className="text-sm text-gray-500">
                Otrzymuj powiadomienia nawet gdy przeglądarka jest zminimalizowana
              </p>
            </div>
            {notificationPermission === 'default' ? (
              <button
                onClick={requestNotificationPermission}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Włącz powiadomienia
              </button>
            ) : (
              <span className={`px-2 py-1 text-sm rounded-md ${
                notificationPermission === 'granted'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {notificationPermission === 'granted' ? 'Włączone' : 'Wyłączone'}
              </span>
            )}
          </div>
        ) : (
          <div className="rounded-md bg-yellow-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <BsExclamationTriangle className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Powiadomienia nie są wspierane
                </h3>
                <p className="mt-2 text-sm text-yellow-700">
                  Twoja przeglądarka nie wspiera powiadomień systemowych.
                </p>
              </div>
            </div>
          </div>
        )}

        <ToggleSwitch
          checked={soundEnabled}
          onChange={setSoundEnabled}
          label="Dźwięki powiadomień"
          description="Odtwarzaj dźwięk przy nowych powiadomieniach"
          icon={<BsBell className="h-5 w-5" />}
        />
      </div>
    </div>
  );

  const renderSystemSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900">
          Informacje systemowe
        </h3>
        <p className="text-sm text-gray-500">
          Szczegóły techniczne systemu.
        </p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-3">
        <div>
          <p className="text-sm text-gray-500">Wersja systemu</p>
          <p className="text-gray-900">1.0.0</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Środowisko</p>
          <p className="text-gray-900">{process.env.NODE_ENV}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Przeglądarka</p>
          <p className="text-gray-900">{navigator.userAgent}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        />

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="w-full">
                <div className="flex justify-between items-center mb-5">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Ustawienia
                  </h3>
                  <button
                    onClick={onClose}
                    className="rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <BsX className="h-6 w-6" />
                  </button>
                </div>

                <div className="border-b border-gray-200">
                  <div className="flex space-x-4">
                    <SettingsTab
                      icon={<BsBell className="h-5 w-5" />}
                      label="Powiadomienia"
                      isActive={activeTab === 'notifications'}
                      onClick={() => setActiveTab('notifications')}
                    />
                    <SettingsTab
                      icon={<BsGear className="h-5 w-5" />}
                      label="System"
                      isActive={activeTab === 'system'}
                      onClick={() => setActiveTab('system')}
                    />
                  </div>
                </div>

                <div className="mt-6">
                  {activeTab === 'notifications' && renderNotificationSettings()}
                  {activeTab === 'system' && renderSystemSettings()}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex justify-center w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Zamknij
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
