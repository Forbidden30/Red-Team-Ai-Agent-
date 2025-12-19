import React, { useState, useRef, useEffect } from 'react';
import { Shield, Terminal, AlertTriangle, Search, FileText, Zap, Lock, Upload, Download } from 'lucide-react';

const CybersecurityAgent = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState('recon');
  const [scanResults, setScanResults] = useState(null);
  const messagesEndRef = useRef(null);

  const modes = [
    { id: 'recon', name: 'Reconnaissance', icon: Search, color: 'blue' },
    { id: 'vuln', name: 'Vulnerability Analysis', icon: AlertTriangle, color: 'orange' },
    { id: 'exploit', name: 'Exploit Research', icon: Zap, color: 'red' },
    { id: 'report', name: 'Report Generation', icon: FileText, color: 'green' },
    { id: 'defense', name: 'Defense Strategy', icon: Lock, color: 'purple' }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const systemPrompts = {
    recon: `You are a cybersecurity reconnaissance expert. Help analyze targets, enumerate services, identify attack surfaces, and gather OSINT. Provide structured reconnaissance strategies and tool recommendations. Always emphasize legal and ethical boundaries.`,
    vuln: `You are a vulnerability assessment specialist. Analyze security weaknesses, provide CVE information, assess risk levels, and suggest remediation strategies. Focus on practical vulnerability identification and prioritization.`,
    exploit: `You are an exploit research analyst. Research exploitation techniques, analyze proof-of-concepts, explain attack vectors, and discuss mitigations. Always frame within legal penetration testing contexts and emphasize responsible disclosure.`,
    report: `You are a security report writer. Generate professional penetration testing reports, executive summaries, technical findings, and remediation roadmaps. Use clear risk ratings and actionable recommendations.`,
    defense: `You are a defensive security strategist. Provide blue team tactics, detection rules, incident response procedures, and hardening recommendations. Focus on proactive defense and threat hunting.`
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          system: systemPrompts[mode],
          messages: [
            ...messages.map(m => ({ role: m.role, content: m.content })),
            { role: 'user', content: input }
          ]
        })
      });

      const data = await response.json();
      const assistantMessage = {
        role: 'assistant',
        content: data.content[0].text
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage = {
        role: 'assistant',
        content: `Error: ${error.message}. Please try again.`
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const runQuickScan = async (scanType) => {
    setLoading(true);
    const scanPrompts = {
      network: "Provide a structured approach for network reconnaissance including: port scanning methodology, service enumeration techniques, and network mapping strategies. Include recommended tools and commands.",
      web: "Outline a comprehensive web application security assessment methodology covering: information gathering, vulnerability scanning, manual testing techniques, and common web vulnerabilities to check.",
      wireless: "Describe wireless network security assessment procedures including: network discovery, encryption analysis, authentication testing, and common wireless attacks.",
      social: "Explain social engineering assessment techniques including: phishing scenarios, pretexting strategies, physical security testing, and awareness training recommendations."
    };

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          messages: [
            { role: 'user', content: scanPrompts[scanType] }
          ]
        })
      });

      const data = await response.json();
      setScanResults({
        type: scanType,
        content: data.content[0].text,
        timestamp: new Date().toLocaleString()
      });
    } catch (error) {
      setScanResults({
        type: scanType,
        content: `Error running scan: ${error.message}`,
        timestamp: new Date().toLocaleString()
      });
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
    setScanResults(null);
  };

  const exportResults = () => {
    const exportData = {
      mode: mode,
      timestamp: new Date().toISOString(),
      messages: messages,
      scanResults: scanResults
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `redteam-session-${Date.now()}.json`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Shield className="w-8 h-8 text-red-500" />
            <div>
              <h1 className="text-2xl font-bold text-white">Red Team AI Agent</h1>
              <p className="text-sm text-gray-400">Advanced Cybersecurity Analysis Platform</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={exportResults}
              className="flex items-center space-x-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            >
              <Download className="w-4 h-4" />
              <span className="text-sm">Export</span>
            </button>
            <button
              onClick={clearChat}
              className="px-3 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors text-sm"
            >
              Clear Session
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4">
        {/* Mode Selector */}
        <div className="mb-4 grid grid-cols-2 md:grid-cols-5 gap-2">
          {modes.map((m) => {
            const Icon = m.icon;
            return (
              <button
                key={m.id}
                onClick={() => setMode(m.id)}
                className={`p-3 rounded-lg border-2 transition-all ${
                  mode === m.id
                    ? `border-${m.color}-500 bg-${m.color}-500 bg-opacity-20`
                    : 'border-gray-700 bg-gray-800 hover:border-gray-600'
                }`}
              >
                <Icon className={`w-5 h-5 mx-auto mb-1 text-${m.color}-500`} />
                <div className="text-xs font-medium text-center">{m.name}</div>
              </button>
            );
          })}
        </div>

        {/* Quick Scan Actions */}
        <div className="mb-4 bg-gray-800 rounded-lg p-4 border border-gray-700">
          <h3 className="text-sm font-semibold mb-3 flex items-center">
            <Terminal className="w-4 h-4 mr-2" />
            Quick Scan Templates
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {[
              { id: 'network', name: 'Network Scan', color: 'blue' },
              { id: 'web', name: 'Web App Scan', color: 'green' },
              { id: 'wireless', name: 'Wireless Audit', color: 'purple' },
              { id: 'social', name: 'Social Engineering', color: 'orange' }
            ].map((scan) => (
              <button
                key={scan.id}
                onClick={() => runQuickScan(scan.id)}
                disabled={loading}
                className={`px-3 py-2 bg-${scan.color}-600 hover:bg-${scan.color}-700 disabled:opacity-50 rounded-lg transition-colors text-sm`}
              >
                {scan.name}
              </button>
            ))}
          </div>
        </div>

        {/* Scan Results */}
        {scanResults && (
          <div className="mb-4 bg-gray-800 rounded-lg p-4 border border-yellow-600">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold flex items-center">
                <Zap className="w-4 h-4 mr-2 text-yellow-500" />
                Scan Results: {scanResults.type.toUpperCase()}
              </h3>
              <span className="text-xs text-gray-400">{scanResults.timestamp}</span>
            </div>
            <div className="bg-gray-900 rounded p-3 text-sm whitespace-pre-wrap font-mono">
              {scanResults.content}
            </div>
          </div>
        )}

        {/* Chat Container */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 flex flex-col" style={{ height: '500px' }}>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-gray-500 mt-20">
                <Shield className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">Select a mode and start your security analysis</p>
                <p className="text-xs mt-2">All activities should be authorized and legal</p>
              </div>
            )}
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-3xl rounded-lg p-3 ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-100'
                  }`}
                >
                  <div className="text-sm whitespace-pre-wrap">{msg.content}</div>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-700 rounded-lg p-3">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-100"></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-200"></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-700">
            <div className="flex space-x-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSubmit(e)}
                placeholder={`Ask about ${modes.find(m => m.id === mode)?.name.toLowerCase()}...`}
                className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500 text-sm"
                disabled={loading}
              />
              <button
                onClick={handleSubmit}
                disabled={loading || !input.trim()}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors text-sm font-medium"
              >
                Send
              </button>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-4 bg-red-900 bg-opacity-20 border border-red-700 rounded-lg p-3">
          <div className="flex items-start space-x-2">
            <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-red-200">
              <strong>Legal Notice:</strong> This tool is for authorized security testing only. 
              Unauthorized access to computer systems is illegal. Always obtain proper authorization 
              before conducting security assessments. Use responsibly and ethically.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CybersecurityAgent;