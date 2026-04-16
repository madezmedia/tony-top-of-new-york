# BrightScript Type Mismatch Fix Guide

## The Error
```
Type Mismatch. "Invalid" is used in IF-clause. (runtime error &h18)
```

## Why This Happens

BrightScript uses `invalid` (like `null` or `undefined` in JavaScript). You **cannot** use `invalid` directly in boolean expressions:

```brightscript
' ❌ CRASHES!
if entry.isPremium then
  ' code here
end if

' ✅ WORKS!
if entry.isPremium <> invalid and entry.isPremium then
  ' code here
end if
```

## Common Patterns

### 1. Checking Boolean Properties

```brightscript
' ❌ WRONG
if entry.isPremium then flags += "premium,"

' ✅ RIGHT
if entry.isPremium <> invalid and entry.isPremium then
  flags += "premium,"
end if
```

### 2. Checking String Properties

```brightscript
' ❌ WRONG
if entry.badge = "premium" then
  ' code here
end if

' ✅ RIGHT
if entry.badge <> invalid and entry.badge = "premium" then
  ' code here
end if
```

### 3. Combining Multiple Conditions

```brightscript
' ❌ WRONG
if entry.isPremium and not m.isLoggedIn and not m.hasRokuPass then
  flags += "locked,"
end if

' ✅ RIGHT
if entry.isPremium <> invalid and entry.isPremium and not m.isLoggedIn and not m.hasRokuPass then
  flags += "locked,"
end if
```

### 4. Accessing Nested Properties

```brightscript
' ❌ WRONG
if entry.metadata.season = 1 then
  ' code here
end if

' ✅ RIGHT - Check each level
if entry.metadata <> invalid and entry.metadata.season <> invalid and entry.metadata.season = 1 then
  ' code here
end if
```

## Helper Functions

Create these utility functions to avoid repetitive checks:

```brightscript
' Safe boolean check
function isTrue(value) as Boolean
  if value = invalid then return false
  return value
end function

' Safe string check
function isEqual(value, target) as Boolean
  if value = invalid then return false
  return value = target
end function

' Safe number check
function isGreaterThan(value, threshold) as Boolean
  if value = invalid then return false
  return value > threshold
end function

' Safe array access
function getArrayItem(arr, index)
  if arr = invalid then return invalid
  if index < 0 or index >= arr.count() then return invalid
  return arr[index]
end function
```

## Using the Helper Functions

```brightscript
' Before:
if entry.isPremium <> invalid and entry.isPremium then
  ' code
end if

' After:
if isTrue(entry.isPremium) then
  ' code
end if
```

## Defensive Programming

### Initialize Default Values

```brightscript
sub addcatalogitem(row as Object, catalogKey as String)
  entry = m.catalog[catalogKey]

  ' Set defaults if missing
  if entry.isPremium = invalid then entry.isPremium = false
  if entry.isNew = invalid then entry.isNew = false
  if entry.badge = invalid then entry.badge = ""

  ' Now safe to use
  if entry.isPremium then
    flags += "premium,"
  end if

  if entry.isNew then
    flags += "new,"
  end if
end sub
```

### Use TypeOf to Check Types

```brightscript
' Check if value is expected type
if TypeOf(entry.isPremium) = "roBoolean" then
  if entry.isPremium then
    ' safe to use
  end if
end if

if TypeOf(entry.title) = "roString" then
  if entry.title <> "" then
    ' safe to use
  end if
end if
```

## Debugging Tips

### 1. Print Variable Values

```brightscript
? "Entry: "; catalogKey
? "isPremium: "; entry.isPremium
? "isNew: "; entry.isNew
? "Type of isPremium: "; TypeOf(entry.isPremium)
```

### 2. Use Try/Catch

```brightscript
try
  if entry.isPremium then
    ' code here
  end if
catch e
  ? "Error checking isPremium: "; e
end try
```

### 3. Validate Catalog Data

```brightscript
sub validateCatalog()
  for each key in m.catalog
    entry = m.catalog[key]

    ' Check required fields
    if entry.title = invalid then
      ? "WARNING: "; key; " missing title"
    end if

    if entry.isPremium = invalid then
      ? "WARNING: "; key; " missing isPremium, setting to false"
      entry.isPremium = false
    end if
  next
end sub
```

## Common Invalid Sources

1. **Missing catalog fields** - Add to catalog JSON
2. **Failed API responses** - Check backend
3. **Uninitialized variables** - Set defaults
4. **Optional UI elements** - Check before use

## Best Practices

1. **Always check for `invalid` before using**
2. **Set default values in catalog**
3. **Use helper functions for common checks**
4. **Validate data on load**
5. **Print debug output during development**

---

## Quick Reference Card

```brightscript
' Boolean check
if value <> invalid and value then

' String equality
if value <> invalid and value = "target" then

' Number comparison
if value <> invalid and value > 0 then

' Object property
if obj <> invalid and obj.prop <> invalid and obj.prop = true then

' Array access
if arr <> invalid and arr.count() > 0 and arr[0] <> invalid then
```

---

**Remember:** BrightScript is NOT JavaScript. `invalid` is not `false`, `null`, or `undefined`. You must explicitly check for it!
