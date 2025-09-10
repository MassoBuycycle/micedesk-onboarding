import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useTranslation } from 'react-i18next';

const LOCAL_KEY_PREFIX = 'userSettings_';

interface LocalSettings {
  avatar?: string; // base64 data url
  color?: string; // hex
}

const UserSettings = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { color: currentColor, setColor: setThemeColor } = useTheme();
  const [avatarPreview, setAvatarPreview] = useState<string | undefined>();
  const [color, setColor] = useState<string>(currentColor);

  useEffect(() => {
    if (user?.id) {
      const saved = localStorage.getItem(`${LOCAL_KEY_PREFIX}${user.id}`);
      if (saved) {
        const parsed: LocalSettings = JSON.parse(saved);
        if (parsed.avatar) setAvatarPreview(parsed.avatar);
        if (parsed.color) setColor(parsed.color);
      }
    }
  }, [user?.id]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setAvatarPreview(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    if (!user?.id) return;
    const toSave: LocalSettings = {
      avatar: avatarPreview,
      color,
    };
    localStorage.setItem(`${LOCAL_KEY_PREFIX}${user.id}`, JSON.stringify(toSave));
    setThemeColor(color);
    toast.success(t('common.saved'));
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">{t('userSettings.title', 'User Settings')}</h1>
      <Card>
        <CardHeader>
          <CardTitle>{t('userSettings.profile', 'Profile')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="avatar">{t('userSettings.avatar', 'Avatar')}</Label>
            {avatarPreview && (
              <img src={avatarPreview} alt="avatar" className="h-24 w-24 rounded-full object-cover" />
            )}
            <Input id="avatar" type="file" accept="image/*" onChange={handleAvatarChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="color">{t('userSettings.themeColor', 'Theme Color')}</Label>
            <Input id="color" type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-20 h-10 p-0 border-none" />
          </div>
          <Button onClick={handleSave}>{t('common.save')}</Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserSettings; 