
import React, { useState, useRef } from 'react';
import { generateSpeech, decode, decodeAudioData, generateProcedureManual } from '../services/geminiService';
import { Card } from '../components/ui/Card';
import { VoiceModel } from '../types';
import { Mic2, Play, Download, Loader2, Music, Volume2, AlertTriangle, FileText, CheckCircle2 } from 'lucide-react';

const TTSView: React.FC = () => {
  const [text, setText] = useState('Sync Shopify VIP orders to Airtable, then trigger Slack alert.');
  const [voice, setVoice] = useState('Kore');
  const [loading, setLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [manual, setManual] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const voices: VoiceModel[] = [
    { id: 'Kore', name: 'Kore', type: 'Professional', description: 'Clear corporate tone' },
    { id: 'Zephyr', name: 'Zephyr', type: 'Friendly', description: 'Approachable and warm' },
    { id: 'Fenrir', name: 'Fenrir', type: 'Calm', description: 'Slow and soothing' },
  ];

  const handleSynthesize = async () => {
    if (!text.trim() || loading) return;
    setLoading(true);
    setAudioUrl(null);
    setManual(null);
    setError(null);

    try {
      // Parallel execution for high-fidelity deliverable
      const [base64Data, procedureDoc] = await Promise.all([
        generateSpeech(text, voice),
        generateProcedureManual(text)
      ]);

      setManual(procedureDoc);

      if (base64Data) {
        const audioContext = new AudioContext({ sampleRate: 24000 });
        const audioBytes = decode(base64Data);
        const buffer = await decodeAudioData(audioBytes, audioContext, 24000, 1);
        const wavBlob = bufferToWav(buffer);
        setAudioUrl(URL.createObjectURL(wavBlob));
      }
    } catch (err: any) {
      setError(err.message || "Synthesis failed.");
    } finally {
      setLoading(false);
    }
  };

  const bufferToWav = (buffer: AudioBuffer): Blob => {
    const numChannels = 1;
    const sampleRate = buffer.sampleRate;
    const format = 1;
    const bitDepth = 16;
    const blockAlign = numChannels * (bitDepth / 8);
    const byteRate = sampleRate * blockAlign;
    const bufferLength = buffer.length * blockAlign;
    const arrayBuffer = new ArrayBuffer(44 + bufferLength);
    const view = new DataView(arrayBuffer);

    const writeString = (offset: number, s: string) => {
      for (let i = 0; i < s.length; i++) view.setUint8(offset + i, s.charCodeAt(i));
    };

    writeString(0, 'RIFF');
    view.setUint32(4, 36 + bufferLength, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, format, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, byteRate, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitDepth, true);
    writeString(36, 'data');
    view.setUint32(40, bufferLength, true);

    const channelData = buffer.getChannelData(0);
    let offset = 44;
    for (let i = 0; i < buffer.length; i++) {
      const sample = Math.max(-1, Math.min(1, channelData[i]));
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
      offset += 2;
    }
    return new Blob([arrayBuffer], { type: 'audio/wav' });
  };

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 animate-in">
      <div className="lg:col-span-5 space-y-8">
        <Card title="Speech Lab" subtitle="Generate Procedure Bundles">
          <div className="space-y-8">
            <div className="grid grid-cols-3 gap-3">
              {voices.map((v) => (
                <button key={v.id} onClick={() => setVoice(v.id)} className={`flex flex-col items-center p-4 rounded-2xl border transition-all ${voice === v.id ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' : 'bg-white border-gray-100 text-gray-500 hover:bg-indigo-50'}`}>
                  <Volume2 size={16} className="mb-2" />
                  <span className="text-[10px] font-black uppercase tracking-widest">{v.name}</span>
                </button>
              ))}
            </div>

            <textarea value={text} onChange={(e) => setText(e.target.value)} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 min-h-[160px] text-sm font-semibold focus:ring-4 focus:ring-indigo-500/10 outline-none" placeholder="Enter logic description..." />

            <button onClick={handleSynthesize} disabled={loading || !text.trim()} className={`w-full py-5 rounded-2xl font-black uppercase tracking-widest text-[11px] flex items-center justify-center gap-3 transition-all ${loading ? 'bg-gray-100 text-gray-400' : 'bg-indigo-600 text-white hover-lift'}`}>
              {loading ? <Loader2 className="animate-spin" size={20} /> : <Mic2 size={20} />}
              {loading ? 'Synthesizing Bundle...' : 'Synthesize Procedure Bundle'}
            </button>
          </div>
        </Card>
      </div>

      <div className="lg:col-span-7 space-y-8">
        {!manual && !loading && (
          <div className="h-full min-h-[500px] border-2 border-dashed border-slate-200 rounded-[3rem] flex flex-col items-center justify-center p-12 text-center bg-white/40">
            <div className="w-20 h-20 bg-slate-50 text-slate-200 rounded-[2rem] flex items-center justify-center mb-6 border border-slate-100"><FileText size={32} /></div>
            <h3 className="text-xl font-black text-slate-300 uppercase tracking-widest">Awaiting Script</h3>
          </div>
        )}

        {manual && (
          <div className="space-y-8 animate-in">
            {audioUrl && (
              <Card title="Audio Deliverable" headerAction={<a href={audioUrl} download="procedure.wav" className="p-3 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition-all"><Download size={18} /></a>}>
                <audio controls src={audioUrl} className="w-full" />
              </Card>
            )}

            <Card title="Operator Manual" subtitle="AI-Generated Protocol" headerAction={<CheckCircle2 className="text-emerald-500" />}>
              <div className="prose prose-slate max-w-none text-sm font-semibold text-slate-700 leading-relaxed whitespace-pre-wrap bg-slate-50 p-8 rounded-3xl border border-slate-100">
                {manual}
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default TTSView;
