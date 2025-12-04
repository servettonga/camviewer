import { useState, useRef, useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCameras } from '@/hooks/useCameras';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Download, Upload, Copy, Check, AlertCircle, RotateCcw, Sun, Moon, Monitor, Server } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { ThemeContext, Theme } from '@/App';

const Settings = () => {
  const { cameras, rtspProxyUrl, exportConfig, importConfig, resetAll, setRtspProxyUrl } = useCameras();
  const { toast } = useToast();
  const { theme, setTheme } = useContext(ThemeContext);
  const [importText, setImportText] = useState('');
  const [copied, setCopied] = useState(false);
  const [importError, setImportError] = useState('');
  const [proxyInput, setProxyInput] = useState(rtspProxyUrl || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync proxy input when loaded from storage
  useEffect(() => {
    setProxyInput(rtspProxyUrl || '');
  }, [rtspProxyUrl]);

  const themeOptions: { value: Theme; label: string; icon: React.ReactNode }[] = [
    { value: 'light', label: 'Light', icon: <Sun className="h-4 w-4" /> },
    { value: 'dark', label: 'Dark', icon: <Moon className="h-4 w-4" /> },
    { value: 'system', label: 'System', icon: <Monitor className="h-4 w-4" /> },
  ];

  const handleExport = () => {
    const data = exportConfig();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `camview-config-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({
      title: 'Configuration exported',
      description: 'Your camera configuration has been downloaded.',
    });
  };

  const handleCopyToClipboard = async () => {
    const data = exportConfig();
    await navigator.clipboard.writeText(data);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: 'Copied to clipboard',
      description: 'Configuration JSON has been copied.',
    });
  };

  const handleImportFromText = () => {
    setImportError('');
    if (!importText.trim()) {
      setImportError('Please paste a configuration JSON');
      return;
    }
    const success = importConfig(importText);
    if (success) {
      setImportText('');
      toast({
        title: 'Configuration imported',
        description: 'Your cameras have been updated.',
      });
    } else {
      setImportError('Invalid configuration format. Please check the JSON.');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = importConfig(content);
      if (success) {
        toast({
          title: 'Configuration imported',
          description: `Loaded configuration from ${file.name}`,
        });
      } else {
        toast({
          title: 'Import failed',
          description: 'Invalid configuration file format.',
          variant: 'destructive',
        });
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleReset = () => {
    resetAll();
    toast({
      title: 'Reset complete',
      description: 'All settings have been restored to defaults with demo cameras.',
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Link to="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-xl font-semibold text-foreground tracking-tight">Settings</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl space-y-6">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>
              Choose how CamView looks on your device.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              {themeOptions.map((option) => (
                <Button
                  key={option.value}
                  variant={theme === option.value ? 'default' : 'outline'}
                  className="flex-1"
                  onClick={() => setTheme(option.value)}
                >
                  {option.icon}
                  <span className="ml-2">{option.label}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5" />
              RTSP Proxy
            </CardTitle>
            <CardDescription>
              Configure a go2rtc or similar proxy server to convert RTSP streams to browser-compatible HLS format.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Input
                value={proxyInput}
                onChange={(e) => setProxyInput(e.target.value)}
                placeholder="http://192.168.1.100:1984"
              />
              <p className="text-xs text-muted-foreground">
                RTSP URLs like <code className="bg-muted px-1 rounded">rtsp://ip:port/stream</code> will be converted to{' '}
                <code className="bg-muted px-1 rounded">[proxy]/api/stream.m3u8?src=[encoded-url]</code>
              </p>
            </div>
            <Button 
              onClick={() => {
                setRtspProxyUrl(proxyInput);
                toast({
                  title: proxyInput ? 'Proxy configured' : 'Proxy removed',
                  description: proxyInput ? 'RTSP streams will now use the proxy.' : 'RTSP proxy has been disabled.',
                });
              }}
            >
              Save Proxy URL
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Export Configuration</CardTitle>
            <CardDescription>
              Download your current configuration with {cameras.length} camera{cameras.length !== 1 ? 's' : ''} as a JSON file.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Button onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" />
                Download JSON
              </Button>
              <Button variant="outline" onClick={handleCopyToClipboard}>
                {copied ? (
                  <Check className="h-4 w-4 mr-2" />
                ) : (
                  <Copy className="h-4 w-4 mr-2" />
                )}
                {copied ? 'Copied!' : 'Copy to Clipboard'}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Import Configuration</CardTitle>
            <CardDescription>
              Upload a JSON file or paste configuration to restore your cameras.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".json"
                className="hidden"
              />
              <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                <Upload className="h-4 w-4 mr-2" />
                Upload JSON File
              </Button>
            </div>
            
            <div className="relative">
              <p className="text-sm text-muted-foreground mb-2">Or paste JSON configuration:</p>
              <Textarea
                value={importText}
                onChange={(e) => {
                  setImportText(e.target.value);
                  setImportError('');
                }}
                placeholder='{"cameras": [...], "gridColumns": 2}'
                className="min-h-[150px] font-mono text-sm"
              />
              {importError && (
                <div className="flex items-center gap-2 mt-2 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  {importError}
                </div>
              )}
              <Button
                className="mt-2"
                onClick={handleImportFromText}
                disabled={!importText.trim()}
              >
                Import from Text
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle>Reset Everything</CardTitle>
            <CardDescription>
              Clear all cameras and settings, then restore demo streams.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset to Defaults
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Reset all settings?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will delete all your cameras and settings. Demo streams will be loaded. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleReset}>
                    Reset Everything
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>About</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>
              <strong>CamView</strong> is a simple camera stream viewer that stores all configuration locally in your browser.
            </p>
            <p>
              <strong>Supported stream types:</strong> HTTP video (MP4/WebM), HLS (.m3u8), MJPEG. RTSP streams require a media server like MediaMTX to convert to web-compatible formats.
            </p>
            <p>
              All data is stored locally and never leaves your device.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Settings;
