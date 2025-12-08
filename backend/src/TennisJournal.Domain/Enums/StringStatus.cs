namespace TennisJournal.Domain.Enums;

public enum StringStatus
{
    Inventory,  // String is in inventory, not yet strung on a racquet
    Strung,     // String is currently strung on a racquet
    Removed     // String was previously strung but has been removed
}
