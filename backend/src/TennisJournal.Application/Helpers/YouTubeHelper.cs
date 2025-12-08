using System.Text.RegularExpressions;

namespace TennisJournal.Application.Helpers;

/// <summary>
/// Helper class for YouTube URL validation and manipulation
/// </summary>
public static class YouTubeHelper
{
    // Regex patterns for YouTube URLs
    private static readonly Regex YoutubeWatchRegex = new(@"^(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})(?:&.*)?$", RegexOptions.Compiled);
    private static readonly Regex YoutubeShortenedRegex = new(@"^(?:https?:\/\/)?(?:www\.)?youtu\.be\/([a-zA-Z0-9_-]{11})(?:\?.*)?$", RegexOptions.Compiled);
    private static readonly Regex TimestampRegex = new(@"^(\d{1,2}):([0-5]\d):([0-5]\d)$", RegexOptions.Compiled);
    
    /// <summary>
    /// Validates if a URL is a valid YouTube URL (supports both youtube.com/watch?v= and youtu.be/ formats)
    /// </summary>
    /// <param name="url">The URL to validate</param>
    /// <returns>True if the URL is valid, false otherwise</returns>
    public static bool IsValidYouTubeUrl(string? url)
    {
        if (string.IsNullOrWhiteSpace(url))
            return false;
            
        return YoutubeWatchRegex.IsMatch(url) || YoutubeShortenedRegex.IsMatch(url);
    }
    
    /// <summary>
    /// Extracts the video ID from a YouTube URL
    /// </summary>
    /// <param name="url">The YouTube URL</param>
    /// <returns>The video ID if found, null otherwise</returns>
    public static string? ExtractVideoId(string? url)
    {
        if (string.IsNullOrWhiteSpace(url))
            return null;
            
        var watchMatch = YoutubeWatchRegex.Match(url);
        if (watchMatch.Success)
            return watchMatch.Groups[1].Value;
            
        var shortenedMatch = YoutubeShortenedRegex.Match(url);
        if (shortenedMatch.Success)
            return shortenedMatch.Groups[1].Value;
            
        return null;
    }
    
    /// <summary>
    /// Validates if a timestamp string is in valid HH:MM:SS format
    /// </summary>
    /// <param name="timestamp">The timestamp string to validate</param>
    /// <returns>True if valid, false otherwise</returns>
    public static bool IsValidTimestampFormat(string? timestamp)
    {
        if (string.IsNullOrWhiteSpace(timestamp))
            return false;
            
        return TimestampRegex.IsMatch(timestamp);
    }
    
    /// <summary>
    /// Converts a HH:MM:SS timestamp string to total seconds
    /// </summary>
    /// <param name="timestamp">The timestamp in HH:MM:SS format</param>
    /// <returns>Total seconds if valid, null otherwise</returns>
    public static int? ConvertTimestampToSeconds(string? timestamp)
    {
        if (string.IsNullOrWhiteSpace(timestamp))
            return null;
            
        var match = TimestampRegex.Match(timestamp);
        if (!match.Success)
            return null;
            
        var hours = int.Parse(match.Groups[1].Value);
        var minutes = int.Parse(match.Groups[2].Value);
        var seconds = int.Parse(match.Groups[3].Value);
        
        return (hours * 3600) + (minutes * 60) + seconds;
    }
    
    /// <summary>
    /// Converts seconds to HH:MM:SS format
    /// </summary>
    /// <param name="totalSeconds">Total seconds</param>
    /// <returns>Formatted timestamp string</returns>
    public static string FormatSecondsToTimestamp(int totalSeconds)
    {
        var hours = totalSeconds / 3600;
        var minutes = (totalSeconds % 3600) / 60;
        var seconds = totalSeconds % 60;
        
        return $"{hours:D2}:{minutes:D2}:{seconds:D2}";
    }
}
