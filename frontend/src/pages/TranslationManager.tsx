import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

const LANGS = [
  { value: 'de', label: 'Deutsch' },
  { value: 'en', label: 'English' },
];

const TranslationManager = () => {
  const [lang, setLang] = useState('de');
  const [content, setContent] = useState('');
  const [dirty, setDirty] = useState(false);

  const fetchTranslations = async (l: string) => {
    try {
      const res = await fetch(`/api/translations/${l}`);
      const data = await res.json();
      setContent(JSON.stringify(data, null, 2));
      setDirty(false);
    } catch (err) {
      toast.error('Fehler beim Laden der Übersetzungen');
    }
  };

  useEffect(() => {
    fetchTranslations(lang);
  }, [lang]);

  const handleSave = async () => {
    try {
      const body = JSON.parse(content);
      await fetch(`/api/translations/${lang}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      toast.success('Übersetzungen gespeichert');
      setDirty(false);
    } catch (err) {
      toast.error('Fehler beim Speichern');
    }
  };

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Translation Manager</h1>
      <Select value={lang} onValueChange={val => setLang(val)}>
        <SelectTrigger className="w-40">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {LANGS.map(l => (
            <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Textarea
        className="w-full h-[500px] font-mono text-xs"
        value={content}
        onChange={e => { setContent(e.target.value); setDirty(true); }}
      />

      <Button disabled={!dirty} onClick={handleSave}>Save</Button>
    </div>
  );
};

export default TranslationManager; 