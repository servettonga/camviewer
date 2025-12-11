import { useState, useRef, useContext } from "react";
import { Link } from "react-router-dom";
import { useCameras } from "@/hooks/useCameras";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Download, Upload, Copy, Check, AlertCircle, RotateCcw, Sun, Moon, Monitor } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
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
} from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ThemeContext, Theme } from "@/App";

const Settings = () => {
  const { cameras, gridColumns, seamlessView, showCameraNames, setGridColumns, setSeamlessView, setShowCameraNames, exportConfig, importConfig, resetAll } = useCameras();
  const { toast } = useToast();
  const { theme, setTheme } = useContext(ThemeContext);
  const [importText, setImportText] = useState("");
  const [copied, setCopied] = useState(false);
  const [importError, setImportError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const themeOptions: { value: Theme; label: string; icon: React.ReactNode }[] = [
    { value: "light", label: "Light", icon: <Sun className="h-4 w-4" /> },
    { value: "dark", label: "Dark", icon: <Moon className="h-4 w-4" /> },
    { value: "system", label: "System", icon: <Monitor className="h-4 w-4" /> },
  ];

  const handleExport = () => {
    const data = exportConfig();
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `camview-config-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({
      title: "Configuration exported",
      description: "Your camera configuration has been downloaded.",
    });
  };

  const handleCopyToClipboard = async () => {
    const data = exportConfig();
    await navigator.clipboard.writeText(data);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: "Copied to clipboard",
      description: "Configuration JSON has been copied.",
    });
  };

  const handleImportFromText = () => {
    setImportError("");
    if (!importText.trim()) {
      setImportError("Please paste a configuration JSON");
      return;
    }
    const success = importConfig(importText);
    if (success) {
      setImportText("");
      toast({
        title: "Configuration imported",
        description: "Your cameras have been updated.",
      });
    } else {
      setImportError("Invalid configuration format. Please check the JSON.");
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
          title: "Configuration imported",
          description: `Loaded configuration from ${file.name}`,
        });
      } else {
        toast({
          title: "Import failed",
          description: "Invalid configuration file format.",
          variant: "destructive",
        });
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleReset = () => {
    resetAll();
    toast({
      title: "Reset complete",
      description: "All settings have been restored to defaults with demo cameras.",
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
            <CardDescription>Choose how CamViewer looks on your device.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Theme</p>
              <div className="flex gap-2">
                {themeOptions.map((option) => (
                  <Button
                    key={option.value}
                    variant={theme === option.value ? "default" : "outline"}
                    className="flex-1"
                    onClick={() => setTheme(option.value)}
                  >
                    {option.icon}
                    <span className="ml-2">{option.label}</span>
                  </Button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">Grid columns</p>
              <Select value={String(gridColumns)} onValueChange={(v) => setGridColumns(Number(v))}>
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2">2</SelectItem>
                  <SelectItem value="4">4</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Seamless View</p>
                <p className="text-sm text-muted-foreground">Remove gaps and rounded corners</p>
              </div>
              <Button
                variant={seamlessView ? "default" : "outline"}
                size="sm"
                onClick={() => setSeamlessView(!seamlessView)}
              >
                {seamlessView ? "On" : "Off"}
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Always Show Camera Names</p>
                <p className="text-sm text-muted-foreground">Keep names visible without hover</p>
              </div>
              <Button
                variant={showCameraNames ? "default" : "outline"}
                size="sm"
                onClick={() => setShowCameraNames(!showCameraNames)}
              >
                {showCameraNames ? "On" : "Off"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Export Configuration</CardTitle>
            <CardDescription>
              Download your current configuration with {cameras.length} camera{cameras.length !== 1 ? "s" : ""} as a
              JSON file.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Button onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" />
                Download JSON
              </Button>
              <Button variant="outline" onClick={handleCopyToClipboard}>
                {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                {copied ? "Copied!" : "Copy to Clipboard"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Import Configuration</CardTitle>
            <CardDescription>Upload a JSON file or paste configuration to restore your cameras.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".json" className="hidden" />
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
                  setImportError("");
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
              <Button className="mt-2" onClick={handleImportFromText} disabled={!importText.trim()}>
                Import from Text
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle>Reset Everything</CardTitle>
            <CardDescription>Clear all cameras and settings, then restore demo streams.</CardDescription>
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
                    This will delete all your cameras and settings. Demo streams will be loaded. This action cannot be
                    undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleReset}>Reset Everything</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>RTSP Streams</CardTitle>
            <CardDescription>How to view RTSP camera streams in CamViewer.</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-3">
            <p>Browsers cannot play RTSP streams directly. You need a media server to convert RTSP to HLS or WebRTC.</p>
            <div>
              <p className="font-medium text-foreground mb-1">Recommended: go2rtc</p>
              <ol className="list-decimal list-inside space-y-1 ml-2">
                <li>
                  Install{" "}
                  <a
                    href="https://github.com/AlexxIT/go2rtc"
                    target="_blank"
                    rel="noopener"
                    className="text-primary hover:underline"
                  >
                    go2rtc
                  </a>{" "}
                  on your local network
                </li>
                <li>Add your RTSP streams to go2rtc config</li>
                <li>
                  Use the HLS URL in CamViewer:
                  <br />
                  <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                    http://[go2rtc-ip]:1984/api/stream.m3u8?src=[stream-name]
                  </code>
                </li>
              </ol>
            </div>
            <p className="text-xs">
              Other options: MediaMTX, Frigate, or Scrypted can also convert RTSP to web formats.
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>About</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>
              <strong>CamViewer</strong> is a simple camera stream viewer that stores all configuration locally in your
              browser.
            </p>
            <p>
              <strong>Supported stream types:</strong> HTTP video (MP4/WebM), HLS (.m3u8), MJPEG.
            </p>
            <p>All data is stored locally and never leaves your device.</p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Settings;
