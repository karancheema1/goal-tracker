export function formatDuration(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}s`;
  }

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    if (minutes > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${hours}h`;
  }

  if (secs > 0) {
    return `${minutes}m ${secs}s`;
  }
  return `${minutes}m`;
}

export function formatDurationLong(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  const parts: string[] = [];

  if (hours > 0) {
    parts.push(`${hours} ${hours === 1 ? 'hour' : 'hours'}`);
  }
  if (minutes > 0) {
    parts.push(`${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`);
  }
  if (secs > 0 && hours === 0) {
    parts.push(`${secs} ${secs === 1 ? 'second' : 'seconds'}`);
  }

  return parts.join(' ') || '0 seconds';
}

export function parseDurationInput(input: string): number | null {
  // Parse formats like "1h 30m", "90m", "1:30:00", etc.
  const trimmed = input.trim().toLowerCase();

  // Try HH:MM:SS or MM:SS format
  const colonMatch = trimmed.match(/^(\d+):(\d{2})(?::(\d{2}))?$/);
  if (colonMatch) {
    if (colonMatch[3]) {
      // HH:MM:SS
      return (
        parseInt(colonMatch[1]) * 3600 +
        parseInt(colonMatch[2]) * 60 +
        parseInt(colonMatch[3])
      );
    }
    // MM:SS
    return parseInt(colonMatch[1]) * 60 + parseInt(colonMatch[2]);
  }

  // Try "Xh Ym Zs" format
  let totalSeconds = 0;
  const hourMatch = trimmed.match(/(\d+)\s*h/);
  const minMatch = trimmed.match(/(\d+)\s*m/);
  const secMatch = trimmed.match(/(\d+)\s*s/);

  if (hourMatch || minMatch || secMatch) {
    if (hourMatch) totalSeconds += parseInt(hourMatch[1]) * 3600;
    if (minMatch) totalSeconds += parseInt(minMatch[1]) * 60;
    if (secMatch) totalSeconds += parseInt(secMatch[1]);
    return totalSeconds;
  }

  // Try plain number (assume minutes)
  const plainNumber = parseInt(trimmed);
  if (!isNaN(plainNumber)) {
    return plainNumber * 60;
  }

  return null;
}
