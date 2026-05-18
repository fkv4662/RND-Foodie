import { useEffect, useMemo, useState } from 'react';
import type { CSSProperties } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from './DashboardLayout';

interface TestoReading {
  id?: number;
  source: string;
  device_id: string;
  device_name: string;
  location: string | null;
  temperature: number | string;
  humidity: number | string | null;
  status: string;
  recorded_at: string;
  imported_at?: string;
}

interface TestoDevice {
  device_id: string;
  device_name: string;
  reading_count?: string | number;
  latest_recorded_at?: string;
}

interface DateFilterState {
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
}

type ViewMode = 'cards' | 'table';

export default function TestoFridge() {
  const navigate = useNavigate();

  const [readings, setReadings] = useState<TestoReading[]>([]);
  const [devices, setDevices] = useState<TestoDevice[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState('all');

  const [alertsOnly, setAlertsOnly] = useState(false);
  const [message, setMessage] = useState('');
  const [loadingReadings, setLoadingReadings] = useState(false);
  const [uploadingCsv, setUploadingCsv] = useState(false);
  const [selectedCsvFile, setSelectedCsvFile] = useState<File | null>(null);

  // Controls whether readings are shown as cards or table.
  const [viewMode, setViewMode] = useState<ViewMode>('cards');

  // Manual entry form state.
  const [deviceId, setDeviceId] = useState('');
  const [deviceName, setDeviceName] = useState('');
  const [location, setLocation] = useState('');
  const [temperature, setTemperature] = useState('');
  const [humidity, setHumidity] = useState('');

  // Date/time filter state.
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('');

  /**
   * Device filter is applied on the frontend.
   * Date and alert filters are still handled by the backend.
   */
  const displayedReadings = useMemo(() => {
    if (selectedDeviceId === 'all') {
      return readings;
    }

    return readings.filter((reading) => reading.device_id === selectedDeviceId);
  }, [readings, selectedDeviceId]);

  /**
   * Summary cards are calculated from what is currently displayed.
   * This means the cards update when the user changes date, alert, or device filters.
   */
  const summary = useMemo(() => {
    const total = displayedReadings.length;
    const alert = displayedReadings.filter((reading) => reading.status === 'ALERT').length;
    const safe = displayedReadings.filter((reading) => reading.status === 'SAFE').length;
    const latest = displayedReadings[0] || null;

    return {
      total,
      alert,
      safe,
      latest,
    };
  }, [displayedReadings]);

  /**
   * Formats a JavaScript Date into YYYY-MM-DD for date input fields.
   */
  function formatLocalDate(date: Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  /**
   * Combines date and time inputs into a datetime string for the backend.
   * If the user leaves the time empty, it uses the start or end of the selected day.
   */
  function buildDateTimeValue(date: string, time: string, defaultTime: string) {
    if (!date) {
      return '';
    }

    return `${date}T${time || defaultTime}:00`;
  }

  /**
   * Builds the query string for date range filtering.
   */
  function buildFilterQuery(filters: DateFilterState) {
    const params = new URLSearchParams();

    const start = buildDateTimeValue(filters.startDate, filters.startTime, '00:00');
    const end = buildDateTimeValue(filters.endDate, filters.endTime, '23:59');

    if (start) {
      params.set('start', start);
    }

    if (end) {
      params.set('end', end);
    }

    const query = params.toString();
    return query ? `?${query}` : '';
  }

  /**
   * Returns the current date/time filter values.
   */
  function getCurrentFilters(): DateFilterState {
    return {
      startDate,
      startTime,
      endDate,
      endTime,
    };
  }

  /**
   * Loads all known Testo devices from the backend.
   * This makes the dropdown update automatically after manual entries or CSV imports.
   */
  async function loadDeviceOptions() {
    try {
      const res = await fetch('/api/testo/devices');
      const data = await res.json();

      if (Array.isArray(data)) {
        setDevices(data);
      }
    } catch {
      // Device filter failing should not stop the whole page from working.
      setDevices([]);
    }
  }

  /**
   * Loads readings from the backend.
   * It can load either all readings or alert-only readings.
   * It also sends the selected date/time filter to the backend.
   */
  async function loadReadings(showAlerts = alertsOnly, overrideFilters?: Partial<DateFilterState>) {
    setLoadingReadings(true);

    const filters: DateFilterState = {
      ...getCurrentFilters(),
      ...overrideFilters,
    };

    try {
      const baseEndpoint = showAlerts ? '/api/testo/alerts' : '/api/testo/readings';
      const endpoint = `${baseEndpoint}${buildFilterQuery(filters)}`;

      const res = await fetch(endpoint);
      const data = await res.json();

      if (Array.isArray(data)) {
        setReadings(data);
      } else {
        setReadings([]);
        setMessage('Failed to load Testo readings');
      }
    } catch {
      setReadings([]);
      setMessage('Failed to load Testo readings');
    } finally {
      setLoadingReadings(false);
    }
  }

  /**
   * Uploads a real Testo CSV export to the backend.
   * The backend imports every sensor column and skips duplicates.
   */
  async function uploadCsvFile() {
    if (!selectedCsvFile) {
      setMessage('Please choose a Testo CSV file first');
      return;
    }

    setUploadingCsv(true);
    setMessage('Importing Testo CSV file...');

    try {
      const csvText = await selectedCsvFile.text();

      const res = await fetch('/api/testo/import-csv', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileName: selectedCsvFile.name,
          csvText,
        }),
      });

      const data = await res.json();

      if (data.success) {
        const sensors = data.result.sensors
          .map((sensor: { device_name: string }) => sensor.device_name)
          .join(', ');

        setMessage(
          `CSV import complete. Inserted ${data.result.inserted} readings, skipped ${data.result.skipped} duplicates. Sensors found: ${sensors}`
        );

        setSelectedCsvFile(null);
        setAlertsOnly(false);

        // Refresh both readings and device dropdown after import.
        await loadReadings(false);
        await loadDeviceOptions();
      } else {
        setMessage(data.message || 'CSV import failed');
      }
    } catch {
      setMessage('CSV import failed');
    } finally {
      setUploadingCsv(false);
    }
  }

  /**
   * Saves a manual fridge reading.
   */
  async function submitManualEntry(e: React.FormEvent) {
    e.preventDefault();
    setMessage('Saving manual entry...');

    try {
      const res = await fetch('/api/testo/manual', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          device_id: deviceId,
          device_name: deviceName,
          location,
          temperature: parseFloat(temperature),
          humidity: humidity ? parseFloat(humidity) : null,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setMessage('Manual entry saved');
        setDeviceId('');
        setDeviceName('');
        setLocation('');
        setTemperature('');
        setHumidity('');
        setAlertsOnly(false);

        // Refresh both readings and device dropdown after manual entry.
        await loadReadings(false);
        await loadDeviceOptions();
      } else {
        setMessage(data.message || 'Manual entry failed');
      }
    } catch {
      setMessage('Manual entry failed');
    }
  }

  /**
   * Shows readings from today.
   */
  async function showToday() {
    const today = formatLocalDate(new Date());

    setStartDate(today);
    setEndDate(today);
    setStartTime('');
    setEndTime('');
    setAlertsOnly(false);

    await loadReadings(false, {
      startDate: today,
      endDate: today,
      startTime: '',
      endTime: '',
    });
  }

  /**
   * Shows readings from the last 7 calendar days.
   */
  async function showLast7Days() {
    const todayDate = new Date();
    const startDateObj = new Date();

    startDateObj.setDate(todayDate.getDate() - 6);

    const start = formatLocalDate(startDateObj);
    const end = formatLocalDate(todayDate);

    setStartDate(start);
    setEndDate(end);
    setStartTime('');
    setEndTime('');
    setAlertsOnly(false);

    await loadReadings(false, {
      startDate: start,
      endDate: end,
      startTime: '',
      endTime: '',
    });
  }

  /**
   * Clears all date/time filters.
   */
  async function clearFilters() {
    setStartDate('');
    setStartTime('');
    setEndDate('');
    setEndTime('');
    setAlertsOnly(false);

    await loadReadings(false, {
      startDate: '',
      startTime: '',
      endDate: '',
      endTime: '',
    });
  }

  /**
   * Applies custom date/time filters selected by the user.
   */
  async function applyCustomFilters() {
    await loadReadings(alertsOnly);
  }

  /**
   * Converts temperature values into a clean display format.
   */
  function formatTemperature(value: number | string) {
    const numberValue = Number(value);

    if (Number.isNaN(numberValue)) {
      return `${value}`;
    }

    return `${numberValue.toFixed(1)}°C`;
  }

  /**
   * Makes CSV cells safe by escaping commas, quotes, and line breaks.
   */
  function escapeCsvCell(value: unknown) {
    const text = value === undefined || value === null ? '' : String(value);
    const escaped = text.replace(/"/g, '""');

    if (escaped.includes(',') || escaped.includes('"') || escaped.includes('\n')) {
      return `"${escaped}"`;
    }

    return escaped;
  }

  /**
   * Downloads the currently displayed readings as a CSV file.
   * This respects:
   * - date/time filters
   * - alert/all filter
   * - selected device filter
   */
  function exportDisplayedReadingsToCsv() {
    if (displayedReadings.length === 0) {
      setMessage('There are no displayed readings to export');
      return;
    }

    const headers = [
      'Source',
      'Device ID',
      'Device Name',
      'Location',
      'Temperature (C)',
      'Humidity (%)',
      'Status',
      'Recorded At',
      'Imported At',
    ];

    const rows = displayedReadings.map((reading) => [
      reading.source,
      reading.device_id,
      reading.device_name,
      reading.location || '',
      reading.temperature,
      reading.humidity ?? '',
      reading.status,
      reading.recorded_at,
      reading.imported_at || '',
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map(escapeCsvCell).join(','))
      .join('\n');

    const blob = new Blob([csvContent], {
      type: 'text/csv;charset=utf-8;',
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    const today = formatLocalDate(new Date());
    const filterName = alertsOnly ? 'alerts' : 'all-readings';
    const deviceName = selectedDeviceId === 'all' ? 'all-devices' : selectedDeviceId;

    link.href = url;
    link.download = `testo-${filterName}-${deviceName}-${today}.csv`;
    link.click();

    URL.revokeObjectURL(url);

    setMessage(`Exported ${displayedReadings.length} displayed reading${displayedReadings.length === 1 ? '' : 's'} to CSV`);
  }

  /**
   * Gives each status a clear visual style.
   */
  function getStatusBadgeStyle(status: string): CSSProperties {
    if (status === 'ALERT') {
      return {
        background: '#fee2e2',
        color: '#991b1b',
        border: '1px solid #fecaca',
      };
    }

    return {
      background: '#dcfce7',
      color: '#166534',
      border: '1px solid #bbf7d0',
    };
  }

  useEffect(() => {
    loadReadings(false);
    loadDeviceOptions();
  }, []);

  return (
    <DashboardLayout title="Testo Fridge">
      <div style={{ background: '#f4f7fb', fontFamily: 'Arial, sans-serif', padding: '24px', borderRadius: '24px' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'flex-start' }}>
            <button type="button" onClick={() => navigate(-1)} style={backButtonStyle}>
              ← Back
            </button>
          </div>

          <h1 style={{ textAlign: 'center', fontSize: '42px', marginBottom: '10px', color: '#12344d' }}>
            Testo Fridge Monitoring
          </h1>

          <p style={{ textAlign: 'center', color: '#64748b', marginBottom: '24px' }}>
            Import real Testo CSV exports, record manual fridge checks, filter readings, and export evidence.
          </p>

          {message && <div style={messageBoxStyle}>{message}</div>}

          <div style={summaryGridStyle}>
            <SummaryCard title="Displayed readings" value={summary.total} note="After current filters" />
            <SummaryCard title="Safe readings" value={summary.safe} note="5°C or below" />
            <SummaryCard title="Alert readings" value={summary.alert} note="Above 5°C" isAlert={summary.alert > 0} />
            <SummaryCard
              title="Latest reading"
              value={summary.latest ? formatTemperature(summary.latest.temperature) : '—'}
              note={summary.latest ? `${summary.latest.device_name} • ${summary.latest.recorded_at}` : 'No readings loaded'}
              isAlert={summary.latest?.status === 'ALERT'}
            />
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '20px',
              marginBottom: '24px',
            }}
          >
            <div style={panelStyle}>
              <h2 style={{ marginTop: 0 }}>Manual Entry</h2>
              <p style={{ color: '#64748b', lineHeight: 1.5 }}>
                Use this if a staff member needs to record a fridge temperature manually.
              </p>

              <form onSubmit={submitManualEntry}>
                <label style={labelStyle}>
                  Device ID
                  <input style={inputStyle} value={deviceId} onChange={(e) => setDeviceId(e.target.value)} required />
                </label>

                <label style={labelStyle}>
                  Device Name
                  <input style={inputStyle} value={deviceName} onChange={(e) => setDeviceName(e.target.value)} required />
                </label>

                <label style={labelStyle}>
                  Location
                  <input style={inputStyle} value={location} onChange={(e) => setLocation(e.target.value)} />
                </label>

                <label style={labelStyle}>
                  Temperature (°C)
                  <input
                    style={inputStyle}
                    type="number"
                    step="0.1"
                    value={temperature}
                    onChange={(e) => setTemperature(e.target.value)}
                    required
                  />
                </label>

                <label style={labelStyle}>
                  Humidity (%)
                  <input
                    style={inputStyle}
                    type="number"
                    step="0.1"
                    value={humidity}
                    onChange={(e) => setHumidity(e.target.value)}
                  />
                </label>

                <button type="submit" style={primaryButtonStyle}>
                  Save Manual Entry
                </button>
              </form>
            </div>

            <div style={panelStyle}>
              <h2 style={{ marginTop: 0 }}>Import Testo CSV</h2>
              <p style={{ color: '#475569', lineHeight: 1.5 }}>
                Export a CSV file from Testo Data Analysis and upload it here. The system imports every sensor column
                and skips duplicates automatically.
              </p>

              <input
                type="file"
                accept=".csv,text/csv"
                onChange={(e) => setSelectedCsvFile(e.target.files?.[0] || null)}
                style={fileInputStyle}
              />

              {selectedCsvFile && (
                <div style={{ color: '#334155', marginBottom: '14px' }}>
                  Selected file: <strong>{selectedCsvFile.name}</strong>
                </div>
              )}

              <button onClick={uploadCsvFile} disabled={uploadingCsv} style={primaryButtonStyle} type="button">
                {uploadingCsv ? 'Importing CSV...' : 'Upload Testo CSV'}
              </button>

              <div style={infoBoxStyle}>
                <strong>Status Rule</strong>
                <div style={{ marginTop: '8px' }}>SAFE = 5°C or below</div>
                <div>ALERT = above 5°C</div>
                <div style={{ marginTop: '8px', color: '#64748b' }}>
                  Testo 164 T1 sensors import temperature only, so humidity will show as “-”.
                </div>
              </div>
            </div>
          </div>

          <div style={panelStyle}>
            <h2 style={{ marginTop: 0 }}>Filters</h2>
            <p style={{ color: '#64748b', lineHeight: 1.5 }}>
              Choose a date range and device. The date filter uses the Testo recorded time, not the upload time.
            </p>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
                gap: '14px',
                marginTop: '16px',
              }}
            >
              <label style={labelStyle}>
                Device
                <select
                  style={inputStyle}
                  value={selectedDeviceId}
                  onChange={(e) => setSelectedDeviceId(e.target.value)}
                >
                  <option value="all">All devices</option>
                  {devices.map((device) => (
                    <option key={device.device_id} value={device.device_id}>
                      {device.device_name}
                    </option>
                  ))}
                </select>
              </label>

              <label style={labelStyle}>
                Start Date
                <input style={inputStyle} type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </label>

              <label style={labelStyle}>
                Start Time
                <input style={inputStyle} type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
              </label>

              <label style={labelStyle}>
                End Date
                <input style={inputStyle} type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </label>

              <label style={labelStyle}>
                End Time
                <input style={inputStyle} type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
              </label>
            </div>

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '18px' }}>
              <button type="button" onClick={applyCustomFilters} style={primaryButtonStyle}>
                Apply Filter
              </button>

              <button type="button" onClick={showToday} style={secondaryButtonStyle}>
                Today
              </button>

              <button type="button" onClick={showLast7Days} style={secondaryButtonStyle}>
                Last 7 Days
              </button>

              <button type="button" onClick={clearFilters} style={secondaryButtonStyle}>
                Clear Date Filter
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedDeviceId('all');
                }}
                style={secondaryButtonStyle}
              >
                Clear Device Filter
              </button>

              <button
                type="button"
                onClick={() => {
                  setAlertsOnly(false);
                  loadReadings(false);
                }}
                style={secondaryButtonStyle}
              >
                Show All
              </button>

              <button
                type="button"
                onClick={() => {
                  setAlertsOnly(true);
                  loadReadings(true);
                }}
                style={secondaryButtonStyle}
              >
                Show Alerts
              </button>
            </div>
          </div>

          <div style={{ ...panelStyle, marginTop: '24px' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: '12px',
                alignItems: 'center',
                flexWrap: 'wrap',
                marginBottom: '16px',
              }}
            >
              <div>
                <h2 style={{ margin: 0 }}>{alertsOnly ? 'Testo Alert Readings' : 'All Testo Fridge Readings'}</h2>
                <p style={{ marginTop: '6px', marginBottom: 0, color: '#64748b' }}>
                  Showing {displayedReadings.length} reading{displayedReadings.length === 1 ? '' : 's'}
                </p>
              </div>

              {loadingReadings && <span style={{ color: '#64748b' }}>Loading...</span>}
            </div>

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '18px' }}>
              <button
                type="button"
                onClick={() => setViewMode('cards')}
                style={viewMode === 'cards' ? activeToggleButtonStyle : secondaryButtonStyle}
              >
                Card View
              </button>

              <button
                type="button"
                onClick={() => setViewMode('table')}
                style={viewMode === 'table' ? activeToggleButtonStyle : secondaryButtonStyle}
              >
                Table View
              </button>

              <button type="button" onClick={exportDisplayedReadingsToCsv} style={exportButtonStyle}>
                Export Displayed CSV
              </button>
            </div>

            {viewMode === 'cards' ? (
              <ReadingsCardView
                readings={displayedReadings}
                formatTemperature={formatTemperature}
                getStatusBadgeStyle={getStatusBadgeStyle}
              />
            ) : (
              <ReadingsTableView
                readings={displayedReadings}
                formatTemperature={formatTemperature}
                getStatusBadgeStyle={getStatusBadgeStyle}
              />
            )}

            {displayedReadings.length === 0 && (
              <p style={{ marginTop: '16px', color: '#64748b' }}>No readings to display.</p>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

/**
 * Displays one dashboard-style summary card.
 */
function SummaryCard({
  title,
  value,
  note,
  isAlert = false,
}: {
  title: string;
  value: string | number;
  note: string;
  isAlert?: boolean;
}) {
  return (
    <div
      style={{
        ...summaryCardStyle,
        borderColor: isAlert ? '#fecaca' : '#bfdbfe',
        background: isAlert ? '#fff7f7' : '#ffffff',
      }}
    >
      <div style={{ color: '#64748b', fontSize: '13px', fontWeight: 800 }}>{title}</div>
      <div style={{ marginTop: '8px', fontSize: '30px', fontWeight: 900, color: isAlert ? '#b91c1c' : '#12344d' }}>
        {value}
      </div>
      <div style={{ marginTop: '6px', color: '#64748b', fontSize: '13px', lineHeight: 1.4 }}>{note}</div>
    </div>
  );
}

/**
 * Displays readings as clean responsive cards.
 */
function ReadingsCardView({
  readings,
  formatTemperature,
  getStatusBadgeStyle,
}: {
  readings: TestoReading[];
  formatTemperature: (value: number | string) => string;
  getStatusBadgeStyle: (status: string) => CSSProperties;
}) {
  return (
    <div style={readingGridStyle}>
      {readings.map((reading, index) => (
        <div
          key={`${reading.device_id}-${reading.recorded_at}-${index}`}
          style={{
            ...readingCardStyle,
            borderColor: reading.status === 'ALERT' ? '#fecaca' : '#dbeafe',
            background: reading.status === 'ALERT' ? '#fff7f7' : '#ffffff',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontWeight: 800, color: '#12344d', fontSize: '18px' }}>{reading.device_name}</div>
              <div style={{ color: '#64748b', fontSize: '13px', marginTop: '4px' }}>
                {reading.location || reading.device_id}
              </div>
            </div>

            <span style={{ ...statusBadgeBaseStyle, ...getStatusBadgeStyle(reading.status) }}>{reading.status}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '18px' }}>
            <div
              style={{
                fontSize: '38px',
                fontWeight: 900,
                color: reading.status === 'ALERT' ? '#b91c1c' : '#0f6b95',
              }}
            >
              {formatTemperature(reading.temperature)}
            </div>
            <div style={{ color: '#64748b', fontSize: '14px' }}>temperature</div>
          </div>

          <div style={readingDetailGridStyle}>
            <div>
              <div style={detailLabelStyle}>Recorded</div>
              <div style={detailValueStyle}>{reading.recorded_at}</div>
            </div>

            <div>
              <div style={detailLabelStyle}>Imported</div>
              <div style={detailValueStyle}>{reading.imported_at || '-'}</div>
            </div>

            <div>
              <div style={detailLabelStyle}>Source</div>
              <div style={detailValueStyle}>{reading.source}</div>
            </div>

            <div>
              <div style={detailLabelStyle}>Humidity</div>
              <div style={detailValueStyle}>{reading.humidity ?? '-'}</div>
            </div>
          </div>

          <div style={{ marginTop: '14px', color: '#94a3b8', fontSize: '12px', wordBreak: 'break-word' }}>
            Device ID: {reading.device_id}
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Displays readings in a wider, cleaner table.
 */
function ReadingsTableView({
  readings,
  formatTemperature,
  getStatusBadgeStyle,
}: {
  readings: TestoReading[];
  formatTemperature: (value: number | string) => string;
  getStatusBadgeStyle: (status: string) => CSSProperties;
}) {
  return (
    <div style={tableOuterStyle}>
      <table style={readingsTableStyle}>
        <thead>
          <tr>
            <th style={tableHeaderStyle}>Device</th>
            <th style={tableHeaderStyle}>Temperature</th>
            <th style={tableHeaderStyle}>Status</th>
            <th style={tableHeaderStyle}>Recorded At</th>
            <th style={tableHeaderStyle}>Source</th>
            <th style={tableHeaderStyle}>Location</th>
            <th style={tableHeaderStyle}>Humidity</th>
            <th style={tableHeaderStyle}>Imported At</th>
          </tr>
        </thead>

        <tbody>
          {readings.map((reading, index) => (
            <tr
              key={`${reading.device_id}-${reading.recorded_at}-${index}`}
              style={reading.status === 'ALERT' ? { background: '#fff7f7' } : {}}
            >
              <td style={tableCellStyle}>
                <div style={{ fontWeight: 800, color: '#12344d' }}>{reading.device_name}</div>
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '3px' }}>{reading.device_id}</div>
              </td>

              <td style={{ ...tableCellStyle, fontWeight: 900, color: reading.status === 'ALERT' ? '#b91c1c' : '#0f6b95' }}>
                {formatTemperature(reading.temperature)}
              </td>

              <td style={tableCellStyle}>
                <span style={{ ...statusBadgeBaseStyle, ...getStatusBadgeStyle(reading.status) }}>{reading.status}</span>
              </td>

              <td style={tableCellStyle}>{reading.recorded_at}</td>
              <td style={tableCellStyle}>{reading.source}</td>
              <td style={tableCellStyle}>{reading.location || '-'}</td>
              <td style={tableCellStyle}>{reading.humidity ?? '-'}</td>
              <td style={tableCellStyle}>{reading.imported_at || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const summaryGridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
  gap: '16px',
  marginBottom: '24px',
};

const summaryCardStyle: CSSProperties = {
  border: '1px solid #bfdbfe',
  borderRadius: '16px',
  padding: '18px',
  boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
};

const panelStyle: CSSProperties = {
  background: '#fff',
  borderRadius: '16px',
  padding: '20px',
  boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
};

const backButtonStyle: CSSProperties = {
  background: '#fff',
  color: '#12344d',
  border: '1px solid #cbd5e1',
  padding: '12px 18px',
  borderRadius: '10px',
  fontWeight: 700,
  cursor: 'pointer',
  boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
};

const messageBoxStyle: CSSProperties = {
  background: '#fff',
  borderRadius: '12px',
  padding: '14px 16px',
  marginBottom: '20px',
  boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
};

const labelStyle: CSSProperties = {
  display: 'block',
  marginBottom: '14px',
  color: '#0f172a',
  fontWeight: 600,
};

const inputStyle: CSSProperties = {
  width: '100%',
  marginTop: '6px',
  padding: '12px',
  borderRadius: '10px',
  border: '1px solid #cbd5e1',
  boxSizing: 'border-box',
  fontSize: '14px',
};

const fileInputStyle: CSSProperties = {
  display: 'block',
  marginTop: '16px',
  marginBottom: '14px',
  padding: '12px',
  background: '#f8fafc',
  borderRadius: '10px',
  border: '1px solid #cbd5e1',
  width: '100%',
  boxSizing: 'border-box',
};

const primaryButtonStyle: CSSProperties = {
  background: '#2563eb',
  color: '#ffffff',
  border: 'none',
  borderRadius: '10px',
  padding: '12px 16px',
  cursor: 'pointer',
  fontWeight: 700,
};

const secondaryButtonStyle: CSSProperties = {
  background: '#e2e8f0',
  color: '#0f172a',
  border: 'none',
  borderRadius: '10px',
  padding: '12px 16px',
  cursor: 'pointer',
  fontWeight: 700,
};

const activeToggleButtonStyle: CSSProperties = {
  background: '#12344d',
  color: '#ffffff',
  border: 'none',
  borderRadius: '10px',
  padding: '12px 16px',
  cursor: 'pointer',
  fontWeight: 800,
};

const exportButtonStyle: CSSProperties = {
  background: '#15803d',
  color: '#ffffff',
  border: 'none',
  borderRadius: '10px',
  padding: '12px 16px',
  cursor: 'pointer',
  fontWeight: 800,
};

const infoBoxStyle: CSSProperties = {
  marginTop: '18px',
  background: '#eff6ff',
  borderRadius: '12px',
  padding: '14px',
  color: '#12344d',
};

const readingGridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))',
  gap: '16px',
};

const readingCardStyle: CSSProperties = {
  border: '1px solid #dbeafe',
  borderRadius: '16px',
  padding: '16px',
  boxShadow: '0 2px 10px rgba(15, 60, 85, 0.06)',
};

const statusBadgeBaseStyle: CSSProperties = {
  borderRadius: '999px',
  padding: '7px 10px',
  fontSize: '12px',
  fontWeight: 800,
  whiteSpace: 'nowrap',
  display: 'inline-block',
};

const readingDetailGridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '12px',
  marginTop: '16px',
  paddingTop: '14px',
  borderTop: '1px solid #e2e8f0',
};

const detailLabelStyle: CSSProperties = {
  color: '#64748b',
  fontSize: '12px',
  fontWeight: 700,
  marginBottom: '4px',
};

const detailValueStyle: CSSProperties = {
  color: '#0f172a',
  fontSize: '13px',
  lineHeight: 1.4,
  wordBreak: 'break-word',
};

const tableOuterStyle: CSSProperties = {
  width: '100%',
  overflowX: 'auto',
  border: '1px solid #e2e8f0',
  borderRadius: '14px',
};

const readingsTableStyle: CSSProperties = {
  width: '100%',
  minWidth: '1050px',
  borderCollapse: 'collapse',
  tableLayout: 'auto',
};

const tableHeaderStyle: CSSProperties = {
  background: '#f8fafc',
  color: '#334155',
  textAlign: 'left',
  padding: '14px',
  fontSize: '13px',
  fontWeight: 900,
  borderBottom: '1px solid #e2e8f0',
  whiteSpace: 'nowrap',
};

const tableCellStyle: CSSProperties = {
  padding: '14px',
  borderBottom: '1px solid #e2e8f0',
  color: '#0f172a',
  fontSize: '13px',
  verticalAlign: 'top',
  whiteSpace: 'nowrap',
};