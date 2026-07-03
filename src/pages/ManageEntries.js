import React, { useCallback, useContext, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Navbar from '../components/Navbar';
import { APTDataContext } from '../contexts/APTDataContext';
import { requestJson } from '../config/api';
import './ManageEntries.css';

const FALLBACK_COLUMNS = [
    'Date',
    'Download Url',
    'Source',
    'CVE',
    'Zero-Day',
    'Threat Actor',
    'Threat Country',
    'Victims',
    'New Start Date',
    'New End Date',
    'Duration',
    'AttackVector',
    'Malware',
    'Target Sectors',
];

const DATE_COLUMNS = new Set(['Date', 'New Start Date', 'New End Date']);
const LONG_TEXT_COLUMNS = new Set(['Download Url', 'CVE', 'Threat Actor', 'Threat Country', 'Victims', 'AttackVector', 'Malware', 'Target Sectors']);
const REQUIRED_COLUMNS = new Set(['Date', 'Source', 'Download Url']);

const buildImportPrompt = (reportUrl) => `You are a cybersecurity analyst specializing in APT (Advanced Persistent Threat) intelligence.
Analyze the following technical report URL: ${reportUrl || '[PASTE_REPORT_URL]'}

Use only information explicitly stated in the technical report itself. Do not use external sources, prior knowledge, threat intelligence databases, vendor blogs, news articles, search results, or assumptions.

First, determine whether the report describes exactly one APT incident.
If the report contains multiple APT campaigns, multiple APT incidents, multiple unrelated threat actors, multiple unrelated operations, or functions as a quarterly/monthly roundup, threat landscape summary, campaign collection, or news digest, return exactly this text and nothing else:
    "The technical report contains multiple APT incidents"
Do not extract individual sub-campaigns from a multi-campaign report. Do not split a roundup report into separate JSON objects.
If the report describes exactly one APT incident, extract the structured information using this exact schema. Do not add, remove, or rename fields.
[
  {
    "Date": "publication date in YYYY-MM-DD format",
    "Download Url": "${reportUrl || 'full URL of the report'}",
    "Source": "the technical report publisher (e.g., CheckPoint, Palo Alto Networks)",
    "CVE": "comma-separated CVE IDs mentioned in the report, or N/A",
    "Zero-Day": "TRUE if a zero-day was exploited, FALSE if not, N/A if not mentioned",
    "Threat Actor": "name of the APT group or threat actor, or N/A",
    "Threat Country": "country attributed to the threat actor in ISO 3166-1 alpha-2 format, e.g., US, RU, CN, or N/A",
    "Victims": "comma-separated victim countries in ISO 3166-1 alpha-2 format, e.g., US, RU, CN, or N/A",
    "New Start Date": "earliest known discovery date of related activity in YYYY-MM-DD format, or empty string if unknown.",
    "New End Date": "latest known discovery date of related activity in YYYY-MM-DD format, or empty string if unknown.",
    "Duration": "total duration of the campaign in days as a number, or N/A if unknown",
    "AttackVector": "initial attack vectors, or N/A. Use: Spear Phishing, Phishing, Watering Hole, Credential Reuse, Social Engineering, Exploit Vulnerability, Malicious Documents, Covert Channels, Drive-by Download, Removable Media, Website Equipping, Meta Data Monitoring.",
    "Malware": "specific malware or tool names used in the attack, or N/A",
    "Target Sectors": "targeted sectors, or N/A. Use: Government and Defense Agencies, Corporations and Businesses, Financial Institutions, Healthcare, Energy and Utilities, Cloud/IoT Services, Manufacturing, Education and Research Institutions, Media and Entertainment Companies, Critical Infrastructure, Non-Governmental Organizations (NGOs) and Nonprofits, Individuals."
  }
]
Final output:
 - If the report describes exactly one APT incident, return only the JSON array in the exact schema above.
 - Do not include markdown fences, explanations, citations, comments, or reasoning.`;

const extractEntriesFromJson = (value) => {
    if (Array.isArray(value)) return value;
    if (value && Array.isArray(value.entries)) return value.entries;
    if (value && typeof value === 'object') return [value];
    return null;
};

const buildEmptyEntry = (columns) =>
    columns.reduce((entry, column) => {
        entry[column] = '';
        return entry;
    }, {});

const normalizeZeroDayValue = (value) => {
    const normalized = String(value ?? '').trim().toUpperCase();
    if (normalized === '1' || normalized === 'TRUE') return 'TRUE';
    if (normalized === '0' || normalized === 'FALSE') return 'FALSE';
    if (normalized === 'N/A' || normalized === 'NA' || normalized === 'NONE' || normalized === 'NULL') return 'N/A';
    return '';
};

const ManageEntries = () => {
    const { refreshData } = useContext(APTDataContext);
    const [columns, setColumns] = useState(FALLBACK_COLUMNS);
    const [entries, setEntries] = useState([]);
    const [formData, setFormData] = useState(buildEmptyEntry(FALLBACK_COLUMNS));
    const [formOpen, setFormOpen] = useState(false);
    const [extractModal, setExtractModal] = useState(null);
    const [extractElapsed, setExtractElapsed] = useState(0);
    const [importModal, setImportModal] = useState(null);
    const [importQueue, setImportQueue] = useState([]);
    const [importQueueTotal, setImportQueueTotal] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isCrudAvailable, setIsCrudAvailable] = useState(true);
    const [message, setMessage] = useState('');
    const [prUrl, setPrUrl] = useState('');
    const [error, setError] = useState('');

    const loadEntries = useCallback(async () => {
        setIsLoading(true);
        setError('');
        try {
            const data = await requestJson('/get-apt-data');
            setIsCrudAvailable(true);
            setColumns(FALLBACK_COLUMNS);
            setEntries(
                data
                    .map((entry, index) => ({ ...entry, 'Zero-Day': normalizeZeroDayValue(entry['Zero-Day']), id: String(index) }))
                    .sort((a, b) => new Date(b.Date) - new Date(a.Date))
            );
            setFormData((current) => ({ ...buildEmptyEntry(FALLBACK_COLUMNS), ...current }));
        } catch (err) {
            setIsCrudAvailable(false);
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => { loadEntries(); }, [loadEntries]);


    const closeForm = () => {
        setFormOpen(false);
        setImportQueue([]);
        setImportQueueTotal(0);
        setPrUrl('');
    };

    const updateField = (column, value) => {
        setFormData((current) => ({ ...current, [column]: value }));
    };

    const entryPayload = () =>
        columns.reduce((payload, column) => {
            const value = formData[column] ?? '';
            payload[column] = column === 'Zero-Day'
                ? normalizeZeroDayValue(value) || 'N/A'
                : REQUIRED_COLUMNS.has(column) || String(value).trim() ? value : 'N/A';
            return payload;
        }, {});

    const saveEntry = async (event) => {
        event.preventDefault();
        setIsSaving(true);
        setMessage('');
        setPrUrl('');
        setError('');

        try {
            const result = await requestJson('/get-apt-data', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ entry: entryPayload() }),
            });
            if (importQueue.length > 0) {
                const [next, ...rest] = importQueue;
                setFormData({ ...buildEmptyEntry(columns), ...next });
                setImportQueue(rest);
                setPrUrl(result.pr_url || '');
                setMessage(`Pull request created. ${rest.length} entr${rest.length === 1 ? 'y' : 'ies'} remaining.`);
            } else {
                setImportQueueTotal(0);
                setPrUrl(result.pr_url || '');
                setMessage('Pull request created — awaiting review.');
                setFormOpen(false);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setIsSaving(false);
        }
    };

    // -----------------------------------------------------------------------
    // Extract-from-report flow
    // -----------------------------------------------------------------------

    useEffect(() => {
        if (!extractModal?.loading) { setExtractElapsed(0); return; }
        const start = extractModal.startedAt || Date.now();
        const id = setInterval(() => setExtractElapsed(Math.floor((Date.now() - start) / 1000)), 1000);
        return () => clearInterval(id);
    }, [extractModal?.loading, extractModal?.startedAt]);

    const openExtractModal = () => {
        setExtractModal({ sourceType: 'url', url: '', file: null, fileName: '', llm: 'claude', apiKey: '', loading: false, error: '', startedAt: null });
        setMessage('');
        setPrUrl('');
        setError('');
    };

    const closeExtractModal = () => {
        if (extractModal?.loading) return;
        setExtractModal(null);
    };

    const runExtraction = async () => {
        const { sourceType, url, file, llm, apiKey } = extractModal;
        if (!apiKey.trim()) {
            setExtractModal((m) => ({ ...m, error: 'Please enter your API key to continue.' }));
            return;
        }
        if (sourceType === 'url' && !url.trim()) {
            setExtractModal((m) => ({ ...m, error: 'Please enter a report URL.' }));
            return;
        }
        if (sourceType === 'pdf' && !file) {
            setExtractModal((m) => ({ ...m, error: 'Please select a PDF file.' }));
            return;
        }

        setExtractModal((m) => ({ ...m, loading: true, error: '', startedAt: Date.now() }));

        try {
            let body;
            if (sourceType === 'url') {
                body = JSON.stringify({ llm, apiKey: apiKey.trim(), sourceType: 'url', url: url.trim() });
            } else {
                // Read PDF as base64
                const pdfBase64 = await new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        // Strip the data:...;base64, prefix
                        const result = e.target.result;
                        resolve(result.split(',')[1]);
                    };
                    reader.onerror = () => reject(new Error('Failed to read PDF file.'));
                    reader.readAsDataURL(file);
                });
                body = JSON.stringify({ llm, apiKey: apiKey.trim(), sourceType: 'pdf', pdfBase64 });
            }

            const { jobId } = await requestJson('/extract-report', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body,
            });

            // Poll until done or error
            // eslint-disable-next-line no-constant-condition
            while (true) {
                await new Promise((r) => setTimeout(r, 4000));
                const status = await requestJson(`/extract-report/${jobId}`);
                if (status.status === 'done') {
                    // Pre-fill form with extracted entry and open it
                    setFormData({ ...buildEmptyEntry(columns), ...status.entry });
                    setMessage('');
                    setError('');
                    setExtractModal(null);
                    setFormOpen(true);
                    break;
                } else if (status.status === 'error') {
                    setExtractModal((m) => ({ ...m, loading: false, error: status.error || 'Extraction failed.' }));
                    break;
                }
            }
        } catch (err) {
            setExtractModal((m) => ({ ...m, loading: false, error: err.message }));
        }
    };

    // -----------------------------------------------------------------------
    // Import JSON flow
    // -----------------------------------------------------------------------

    const startImportReview = () => {
        if (!importModal?.entries?.length) { updateImportModal({ error: 'Please upload a JSON file before reviewing.' }); return; }
        const [first, ...rest] = importModal.entries;
        setImportQueue(rest);
        setImportQueueTotal(importModal.entries.length);
        setFormData({ ...buildEmptyEntry(columns), ...first });
        setImportModal(null);
        setMessage('');
        setError('');
        setFormOpen(true);
    };

    const openImportModal = () => {
        setImportModal({ error: '', copied: false, reportUrl: '', fileName: '', entries: null, rawText: '' });
        setMessage('');
        setPrUrl('');
        setError('');
    };

    const closeImportModal = () => {
        if (importModal?.loading) return;
        setImportModal(null);
    };

    const updateImportModal = (updater) => {
        setImportModal((current) => {
            const next = typeof updater === 'function' ? updater(current) : updater;
            if (!next) return next;
            return { ...current, ...next };
        });
    };

    const handleImportFile = async (file) => {
        if (!file) return;
        try {
            const rawText = await file.text();
            const parsed = JSON.parse(rawText);
            const entries = extractEntriesFromJson(parsed);
            if (!entries) {
                updateImportModal({ error: 'The JSON file must contain an array of entries or a single entry object.', fileName: file.name, rawText, entries: null });
                return;
            }
            updateImportModal({ error: '', fileName: file.name, rawText, entries });
        } catch (err) {
            updateImportModal({ error: `Could not read the JSON file: ${err.message}`, fileName: file.name, rawText: '', entries: null });
        }
    };

    const copyImportPrompt = async () => {
        try {
            await navigator.clipboard.writeText(buildImportPrompt(importModal?.reportUrl || ''));
            updateImportModal({ copied: true, error: '' });
            window.setTimeout(() => setImportModal((current) => (current ? { ...current, copied: false } : current)), 1400);
        } catch (err) {
            updateImportModal({ error: `Could not copy the prompt: ${err.message}` });
        }
    };

    const entryFormPortal = formOpen ? createPortal(
        <div className="form-modal-overlay" onClick={closeForm}>
            <div className="form-modal" onClick={(e) => e.stopPropagation()}>
                <div className="form-modal-header">
                    <div className="form-modal-title-group">
                        <div className="form-modal-title">
                            {importQueueTotal > 1
                                ? `Add entry ${importQueueTotal - importQueue.length} of ${importQueueTotal}`
                                : 'Add entry'}
                        </div>
                    </div>
                    <button type="button" className="form-modal-close" onClick={closeForm}>&#x2715;</button>
                </div>

                <div className="form-modal-body">
                    {(message || error) && (
                        <div className={`manage-alert ${error ? 'manage-alert-error' : ''}`} style={{ marginBottom: 20 }}>
                            {error || message}
                            {!error && prUrl && (
                                <> &mdash; <a href={prUrl} target="_blank" rel="noopener noreferrer">View pull request &rarr;</a></>
                            )}
                        </div>
                    )}

                    <form onSubmit={saveEntry}>
                        {/* Publication */}
                        <div className="form-section">
                            <div className="form-section-title">
                                <span className="form-section-dot form-section-dot--blue" />
                                Publication
                            </div>
                            <div className="form-section-grid">
                                <label className="form-field">
                                    <span className="form-label">Date <span className="form-required">*</span></span>
                                    <input type="date" value={formData['Date'] ?? ''} onChange={(e) => updateField('Date', e.target.value)} required />
                                </label>
                                <label className="form-field">
                                    <span className="form-label">Source</span>
                                    <input type="text" value={formData['Source'] ?? ''} onChange={(e) => updateField('Source', e.target.value)} placeholder="e.g. Mandiant, CrowdStrike" required />
                                </label>
                                <label className="form-field form-field--full">
                                    <span className="form-label">Download URL</span>
                                    <input type="text" value={formData['Download Url'] ?? ''} onChange={(e) => updateField('Download Url', e.target.value)} placeholder="https://..." required />
                                </label>
                            </div>
                        </div>

                        {/* Threat Actor */}
                        <div className="form-section">
                            <div className="form-section-title">
                                <span className="form-section-dot form-section-dot--red" />
                                Threat actor
                            </div>
                            <div className="form-section-grid">
                                <label className="form-field form-field--wide">
                                    <span className="form-label">Threat Actor</span>
                                    <input type="text" value={formData['Threat Actor'] ?? ''} onChange={(e) => updateField('Threat Actor', e.target.value)} placeholder="e.g. APT28, Lazarus Group" />
                                </label>
                                <label className="form-field">
                                    <span className="form-label">Threat Country</span>
                                    <input type="text" value={formData['Threat Country'] ?? ''} onChange={(e) => updateField('Threat Country', e.target.value)} placeholder="e.g. RU, CN, KP" />
                                </label>
                                <label className="form-field">
                                    <span className="form-label">Victims</span>
                                    <input type="text" value={formData['Victims'] ?? ''} onChange={(e) => updateField('Victims', e.target.value)} placeholder="e.g. US, DE, UA" />
                                </label>
                            </div>
                        </div>

                        {/* Attack Details */}
                        <div className="form-section">
                            <div className="form-section-title">
                                <span className="form-section-dot form-section-dot--orange" />
                                Attack details
                            </div>
                            <div className="form-section-grid">
                                <label className="form-field form-field--3">
                                    <span className="form-label">CVE</span>
                                    <input type="text" value={formData['CVE'] ?? ''} onChange={(e) => updateField('CVE', e.target.value)} placeholder="e.g. CVE-2024-1234, CVE-2024-5678" />
                                </label>
                                <label className="form-field">
                                    <span className="form-label">Zero-Day</span>
                                    <select
                                        value={normalizeZeroDayValue(formData['Zero-Day']) || 'N/A'}
                                        onChange={(e) => updateField('Zero-Day', normalizeZeroDayValue(e.target.value) || 'N/A')}
                                    >
                                        <option value="N/A">N/A</option>
                                        <option value="TRUE">TRUE</option>
                                        <option value="FALSE">FALSE</option>
                                    </select>
                                </label>
                                <label className="form-field form-field--full">
                                    <span className="form-label">Attack Vector</span>
                                    <textarea rows={2} value={formData['AttackVector'] ?? ''} onChange={(e) => updateField('AttackVector', e.target.value)} placeholder="e.g. Spear Phishing, Exploit Vulnerability" />
                                </label>
                                <label className="form-field form-field--full">
                                    <span className="form-label">Malware</span>
                                    <textarea rows={2} value={formData['Malware'] ?? ''} onChange={(e) => updateField('Malware', e.target.value)} placeholder="e.g. Cobalt Strike, PlugX" />
                                </label>
                            </div>
                        </div>

                        {/* Impact */}
                        <div className="form-section">
                            <div className="form-section-title">
                                <span className="form-section-dot form-section-dot--purple" />
                                Impact
                            </div>
                            <div className="form-section-grid">
                                <label className="form-field form-field--full">
                                    <span className="form-label">Target Sectors</span>
                                    <textarea rows={2} value={formData['Target Sectors'] ?? ''} onChange={(e) => updateField('Target Sectors', e.target.value)} placeholder="e.g. Government and Defense Agencies, Healthcare" />
                                </label>
                            </div>
                        </div>

                        {/* Timeline */}
                        <div className="form-section">
                            <div className="form-section-title">
                                <span className="form-section-dot form-section-dot--green" />
                                Timeline
                            </div>
                            <div className="form-section-grid">
                                <label className="form-field">
                                    <span className="form-label">Campaign Start</span>
                                    <input type="date" value={formData['New Start Date'] ?? ''} onChange={(e) => updateField('New Start Date', e.target.value)} />
                                </label>
                                <label className="form-field">
                                    <span className="form-label">Campaign End</span>
                                    <input type="date" value={formData['New End Date'] ?? ''} onChange={(e) => updateField('New End Date', e.target.value)} />
                                </label>
                                <label className="form-field">
                                    <span className="form-label">Duration (days)</span>
                                    <input type="text" value={formData['Duration'] ?? ''} onChange={(e) => updateField('Duration', e.target.value)} placeholder="e.g. 30" />
                                </label>
                            </div>
                        </div>
                        <div className="manage-form-actions">
                            <button type="submit" className="primary-button" disabled={isSaving || !isCrudAvailable || [...REQUIRED_COLUMNS].some(col => !String(formData[col] ?? '').trim())}>
                                {isSaving ? 'Submitting PR...' : 'Submit entry'}
                            </button>
                            {importQueue.length > 0 && (
                                <button type="button" className="ghost-button" disabled={isSaving} onClick={() => {
                                    const [next, ...rest] = importQueue;
                                    setFormData({ ...buildEmptyEntry(columns), ...next });
                                    setImportQueue(rest);
                                    setMessage('');
                                    setError('');
                                }}>Skip</button>
                            )}
                            <button type="button" className="ghost-button" onClick={closeForm} disabled={isSaving}>Cancel</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>,
        document.body
    ) : null;

    const extractModalPortal = extractModal ? createPortal(
        <div className="run-claude-overlay" onClick={!extractModal.loading ? closeExtractModal : undefined}>
            <div className="run-claude-modal run-claude-modal--llm" onClick={(e) => e.stopPropagation()}>
                <div className="form-modal-header">
                    <div className="form-modal-title">Add Entry &mdash; Extract from Report</div>
                    {!extractModal.loading && (
                        <button type="button" className="form-modal-close" onClick={closeExtractModal}>&#x2715;</button>
                    )}
                </div>
                <div className="form-modal-body">
                    {extractModal.loading ? (
                        <div className="run-claude-loading">
                            <div className="run-claude-spinner" />
                            <div className="run-claude-loading-phase">Extracting information from the report&hellip;</div>
                            <div className="run-claude-loading-elapsed">
                                Running for {Math.floor(extractElapsed / 60) > 0
                                    ? `${Math.floor(extractElapsed / 60)}m ${extractElapsed % 60}s`
                                    : `${extractElapsed}s`} &middot; usually takes 10&ndash;30 s
                            </div>
                        </div>
                    ) : (
                        <>
                            <p className="run-claude-desc">
                                Provide a report URL or upload a PDF. The model will read the report and pre-fill the entry form for your review.
                            </p>

                            {/* Source type toggle */}
                            <div className="llm-section">
                                <div className="llm-section-label">Report source</div>
                                <div className="run-claude-model-row">
                                    <button
                                        type="button"
                                        className={`run-claude-model-btn${extractModal.sourceType === 'url' ? ' active' : ''}`}
                                        onClick={() => setExtractModal((m) => ({ ...m, sourceType: 'url', file: null, fileName: '' }))}
                                    >
                                        <span className="run-claude-model-name">URL</span>
                                        <span className="run-claude-model-provider">Web page or PDF link</span>
                                    </button>
                                    <button
                                        type="button"
                                        className={`run-claude-model-btn${extractModal.sourceType === 'pdf' ? ' active' : ''}`}
                                        onClick={() => setExtractModal((m) => ({ ...m, sourceType: 'pdf', url: '' }))}
                                    >
                                        <span className="run-claude-model-name">PDF</span>
                                        <span className="run-claude-model-provider">Upload a file</span>
                                    </button>
                                </div>
                            </div>

                            {/* URL or file input */}
                            {extractModal.sourceType === 'url' ? (
                                <div className="llm-section">
                                    <div className="llm-section-label">Report URL</div>
                                    <input
                                        type="text"
                                        className="llm-key-input"
                                        value={extractModal.url}
                                        onChange={(e) => setExtractModal((m) => ({ ...m, url: e.target.value }))}
                                        placeholder="https://..."
                                        autoComplete="off"
                                    />
                                </div>
                            ) : (
                                <div className="llm-section">
                                    <div className="llm-section-label">PDF file</div>
                                    <input
                                        type="file"
                                        accept=".pdf,application/pdf"
                                        onChange={(e) => {
                                            const f = e.target.files?.[0] || null;
                                            setExtractModal((m) => ({ ...m, file: f, fileName: f ? f.name : '' }));
                                        }}
                                    />
                                    {extractModal.fileName && (
                                        <span className="run-claude-key-hint" style={{ marginTop: 4, display: 'block' }}>
                                            Selected: {extractModal.fileName}
                                        </span>
                                    )}
                                </div>
                            )}

                            {/* Model selector */}
                            <div className="llm-section">
                                <div className="llm-section-label">Model</div>
                                <div className="run-claude-model-row">
                                    <button
                                        type="button"
                                        className={`run-claude-model-btn run-claude-model-btn--anthropic${extractModal.llm === 'claude' ? ' active' : ''}`}
                                        onClick={() => setExtractModal((m) => ({ ...m, llm: 'claude' }))}
                                    >
                                        <span className="run-claude-model-name">Claude Opus 4.8</span>
                                        <span className="run-claude-model-provider">Anthropic</span>
                                    </button>
                                    <button
                                        type="button"
                                        className={`run-claude-model-btn run-claude-model-btn--google${extractModal.llm === 'gemini' ? ' active' : ''}`}
                                        onClick={() => setExtractModal((m) => ({ ...m, llm: 'gemini' }))}
                                    >
                                        <span className="run-claude-model-name">Gemini 3.5 Flash</span>
                                        <span className="run-claude-model-provider">Google</span>
                                    </button>
                                    <button
                                        type="button"
                                        className={`run-claude-model-btn run-claude-model-btn--openai${extractModal.llm === 'chatgpt' ? ' active' : ''}`}
                                        onClick={() => setExtractModal((m) => ({ ...m, llm: 'chatgpt' }))}
                                    >
                                        <span className="run-claude-model-name">GPT-5.5</span>
                                        <span className="run-claude-model-provider">OpenAI</span>
                                    </button>
                                </div>
                            </div>

                            {/* API key */}
                            <div className="llm-section">
                                <div className="llm-section-label">
                                    {extractModal.llm === 'gemini' ? 'Google AI API key' : extractModal.llm === 'chatgpt' ? 'OpenAI API key' : 'Anthropic API key'}
                                </div>
                                <input
                                    type="password"
                                    className="llm-key-input"
                                    value={extractModal.apiKey}
                                    onChange={(e) => setExtractModal((m) => ({ ...m, apiKey: e.target.value }))}
                                    placeholder={extractModal.llm === 'gemini' ? 'AIza...' : extractModal.llm === 'chatgpt' ? 'sk-...' : 'sk-ant-...'}
                                    autoComplete="off"
                                />
                                <span className="run-claude-key-hint" style={{ marginTop: 6, display: 'block' }}>
                                    {extractModal.llm === 'gemini'
                                        ? 'Used only for this extraction and never stored. Get one at aistudio.google.com.'
                                        : extractModal.llm === 'chatgpt'
                                        ? 'Used only for this extraction and never stored. Get one at platform.openai.com.'
                                        : 'Used only for this extraction and never stored. Get one at console.anthropic.com.'}
                                </span>
                            </div>

                            {extractModal.error && (
                                <div className="manage-alert manage-alert-error" style={{ marginBottom: 16 }}>{extractModal.error}</div>
                            )}

                            <div className="manage-form-actions">
                                <button
                                    type="button"
                                    className="primary-button"
                                    onClick={runExtraction}
                                    disabled={!extractModal.apiKey.trim() || (extractModal.sourceType === 'url' ? !extractModal.url.trim() : !extractModal.file)}
                                >
                                    Review
                                </button>
                                <button type="button" className="ghost-button" onClick={closeExtractModal}>Cancel</button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>,
        document.body
    ) : null;

    const importModalPortal = importModal ? createPortal(
        <div className="run-claude-overlay" onClick={closeImportModal}>
            <div className="run-claude-modal run-claude-modal--import" onClick={(e) => e.stopPropagation()}>
                <div className="form-modal-header">
                    <div className="form-modal-title">Import JSON from LLM</div>
                    <button type="button" className="form-modal-close" onClick={closeImportModal}>&#x2715;</button>
                </div>
                <div className="form-modal-body">
                    <p className="run-claude-desc">
                        Use the prompt below with a report link in your LLM, then upload the JSON response. You will review each entry in the form before saving.
                    </p>
                    <div className="run-claude-label" style={{ marginBottom: 16 }}>
                        Technical report URL
                        <input
                            type="text"
                            value={importModal.reportUrl}
                            onChange={(e) => updateImportModal({ reportUrl: e.target.value })}
                            placeholder="https://..."
                        />
                    </div>
                    <div className="run-claude-label" style={{ marginBottom: 16 }}>
                        Prompt to send to the LLM
                        <textarea value={buildImportPrompt(importModal.reportUrl)} readOnly rows={10} />
                    </div>
                    <div className="manage-form-actions" style={{ marginTop: 0, paddingTop: 0, borderTop: 'none', justifyContent: 'flex-start' }}>
                        <button
                            type="button"
                            className={`primary-button import-copy-button${importModal.copied ? ' copied' : ''}`}
                            onClick={copyImportPrompt}
                        >
                            {importModal.copied ? 'Copied!' : 'Copy prompt'}
                        </button>
                    </div>
                    <div className="run-claude-label" style={{ marginTop: 18, marginBottom: 16 }}>
                        JSON file
                        <input
                            type="file"
                            accept=".json,application/json"
                            onChange={(e) => handleImportFile(e.target.files?.[0])}
                        />
                        <span className="run-claude-key-hint">
                            {importModal.fileName
                                ? `Selected: ${importModal.fileName}${importModal.entries ? ` (${importModal.entries.length} entr${importModal.entries.length === 1 ? 'y' : 'ies'})` : ''}`
                                : 'Upload the JSON file returned by your LLM.'}
                        </span>
                    </div>
                    {importModal.error && (
                        <div className="manage-alert manage-alert-error" style={{ marginBottom: 16 }}>{importModal.error}</div>
                    )}
                    <div className="manage-form-actions">
                        <button
                            type="button"
                            className="primary-button"
                            onClick={startImportReview}
                            disabled={!(importModal.entries || []).length}
                        >
                            Review
                        </button>
                        <button type="button" className="ghost-button" onClick={closeImportModal}>Cancel</button>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    ) : null;

    return (
        <div>
            <Navbar />
            <main className="manage-page">
                <header className="manage-header">
                    <div>
                        <h1>Add Entries</h1>
                    </div>
                    <button type="button" onClick={loadEntries} disabled={isLoading || isSaving}>
                        Refresh
                    </button>
                </header>

                {(message || error) && !formOpen && !extractModal && !importModal && (
                    <div className={`manage-alert ${error ? 'manage-alert-error' : ''}`}>
                        {error || message}
                        {!error && prUrl && (
                            <> &mdash; <a href={prUrl} target="_blank" rel="noopener noreferrer">View pull request &rarr;</a></>
                        )}
                    </div>
                )}

                <div className="feature-cards">
                    <div className="feature-card">
                        <div className="feature-card-icon">&#10133;</div>
                        <div className="feature-card-content">
                            <div className="feature-card-title">Add Entry</div>
                            <div className="feature-card-desc">
                                Provide a report URL or PDF — an LLM will extract the entry fields for your review before saving.
                            </div>
                        </div>
                        <button
                            type="button"
                            className="primary-button"
                            onClick={openExtractModal}
                            disabled={!isCrudAvailable}
                        >
                            Add Entry
                        </button>
                    </div>

                    <div className="feature-card">
                        <div className="feature-card-icon">&#128196;</div>
                        <div className="feature-card-content">
                            <div className="feature-card-title">Import JSON</div>
                            <div className="feature-card-desc">
                                Copy the LLM prompt, paste it into any LLM with your report URL, then upload the returned JSON for validation and import.
                            </div>
                        </div>
                        <button
                            type="button"
                            className="primary-button"
                            onClick={openImportModal}
                            disabled={!isCrudAvailable}
                        >
                            Import JSON
                        </button>
                    </div>
                </div>

                <section className="manage-table-section">
                    <div className="manage-table-toolbar">
                        <span>{entries.length} entries</span>
                    </div>

                    <div className="manage-table-wrap">
                        <table className="manage-table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Source</th>
                                    <th>Download URL</th>
                                    <th>CVE</th>
                                    <th>Zero-Day</th>
                                    <th>Threat Actor</th>
                                    <th>Threat Country</th>
                                    <th>Victims</th>
                                    <th>Attack Vector</th>
                                    <th>Malware</th>
                                    <th>Target Sectors</th>
                                    <th>Campaign Start</th>
                                    <th>Campaign End</th>
                                    <th>Duration (days)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {isLoading ? (
                                    <tr>
                                        <td colSpan="14" className="empty-row">Loading entries</td>
                                    </tr>
                                ) : entries.length ? (
                                    entries.map((entry) => (
                                        <tr key={entry.id}>
                                            <td>{entry.Date}</td>
                                            <td>{entry.Source}</td>
                                            <td className="cell-url">
                                                {entry['Download Url'] && entry['Download Url'] !== 'N/A'
                                                    ? <a href={entry['Download Url']} target="_blank" rel="noreferrer">Link</a>
                                                    : entry['Download Url']}
                                            </td>
                                            <td>{entry.CVE}</td>
                                            <td>{entry['Zero-Day']}</td>
                                            <td>{entry['Threat Actor']}</td>
                                            <td>{entry['Threat Country']}</td>
                                            <td>{entry.Victims}</td>
                                            <td>{entry.AttackVector}</td>
                                            <td>{entry.Malware}</td>
                                            <td>{entry['Target Sectors']}</td>
                                            <td>{entry['New Start Date']}</td>
                                            <td>{entry['New End Date']}</td>
                                            <td>{entry.Duration}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="14" className="empty-row">No entries</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>
            </main>

            {extractModalPortal}
            {importModalPortal}
            {entryFormPortal}
        </div>
    );
};

export default ManageEntries;
