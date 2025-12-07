using System.Text.Json;
using System.Text.Json.Serialization;

namespace TennisJournal.Api.Converters;

/// <summary>
/// JSON converter that handles enums from various formats:
/// - Integer values (e.g., 4)
/// - String integer values (e.g., "4")
/// - Enum names (e.g., "Tournament")
/// </summary>
public class FlexibleEnumConverter<TEnum> : JsonConverter<TEnum> where TEnum : struct, Enum
{
    public override TEnum Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        switch (reader.TokenType)
        {
            case JsonTokenType.Number:
                var intValue = reader.GetInt32();
                if (Enum.IsDefined(typeof(TEnum), intValue))
                {
                    return (TEnum)Enum.ToObject(typeof(TEnum), intValue);
                }
                throw new JsonException($"Invalid enum value: {intValue}");

            case JsonTokenType.String:
                var stringValue = reader.GetString();
                if (string.IsNullOrEmpty(stringValue))
                {
                    throw new JsonException("Enum value cannot be null or empty");
                }

                // Try parsing as integer string first (e.g., "4")
                if (int.TryParse(stringValue, out var parsedInt))
                {
                    if (Enum.IsDefined(typeof(TEnum), parsedInt))
                    {
                        return (TEnum)Enum.ToObject(typeof(TEnum), parsedInt);
                    }
                    throw new JsonException($"Invalid enum value: {parsedInt}");
                }

                // Try parsing as enum name (e.g., "Tournament")
                if (Enum.TryParse<TEnum>(stringValue, ignoreCase: true, out var enumValue))
                {
                    return enumValue;
                }
                throw new JsonException($"Invalid enum value: {stringValue}");

            default:
                throw new JsonException($"Unexpected token type: {reader.TokenType}");
        }
    }

    public override void Write(Utf8JsonWriter writer, TEnum value, JsonSerializerOptions options)
    {
        writer.WriteNumberValue(Convert.ToInt32(value));
    }
}

/// <summary>
/// Factory for creating FlexibleEnumConverter instances
/// </summary>
public class FlexibleEnumConverterFactory : JsonConverterFactory
{
    public override bool CanConvert(Type typeToConvert)
    {
        return typeToConvert.IsEnum;
    }

    public override JsonConverter? CreateConverter(Type typeToConvert, JsonSerializerOptions options)
    {
        var converterType = typeof(FlexibleEnumConverter<>).MakeGenericType(typeToConvert);
        return (JsonConverter?)Activator.CreateInstance(converterType);
    }
}
