# UI Field to Database Field Mapping

This document maps the German UI labels in the Events form to their corresponding database fields and tables.

## 📋 1. Contact Section (Kontaktdetails)

| German UI Label | Database Field | Table | Type |
|---|---|---|---|
| Name | `contact_name` | events | VARCHAR |
| Position | `contact_position` | events | VARCHAR |
| Telefon | `contact_phone` | events | VARCHAR |
| E-Mail | `contact_email` | events | VARCHAR |

## 🏢 2. General Information (General information event spaces)

| German UI Label | Database Field | Table | Type |
|---|---|---|---|
| Verkaufen Sie Ihre Tagungsräume nur in Verbindung mit Hotelzimmern? | `sold_with_rooms_only` | event_operations | BOOLEAN |

## 📍 3. Location Information

| German UI Label | Database Field | Table | Type |
|---|---|---|---|
| Wo werden die Kaffeepausen serviert? | `coffee_break_location` | event_operations | TEXT |
| Wo findet das Mittagessen statt? | `lunch_location` | event_operations | TEXT |

## ⚙️ 4. Technology / Service (Technik/ Service und Preise)

| German UI Label | Database Field | Table | Type |
|---|---|---|---|
| Sind die Besprechungsräume schalldicht? | `is_soundproof` | event_technical | BOOLEAN |
| Haben alle Besprechungsräume Tageslicht? | `has_daylight` | event_technical | BOOLEAN |
| Haben alle Besprechungsräume Verdunklungsvorhänge? | `has_blackout_curtains` | event_technical | BOOLEAN |
| Verfügen alle Räume über eine Klimaanlage oder ein Belüftungssystem? | `has_ac_or_ventilation` | event_technical | BOOLEAN |
| Sind Hybrid-Meetings möglich? | `is_hybrid_meeting_possible` | event_technical | BOOLEAN |
| Gibt es im Hotel einen technischen Support? | `technical_support_available` | event_technical | BOOLEAN |
| Wie hoch ist die Datenrate des WLAN? | `wifi_data_rate` | event_technical | VARCHAR |
| Wie viele Lumen haben die Beamer? | `beamer_lumens` | event_technical | VARCHAR |
| Welche Präsentations-/Übertragungssoftware wird verwendet? Z. B. Clickshare? | `software_presentation` | event_technical | VARCHAR |
| Kosten für Kopien | `copy_cost` | event_technical | DECIMAL(10,2) |

## 🎤 5. Technical Equipment (Technische Ausstattung)

| German Equipment Name | Database Field | Table | Type | Notes |
|---|---|---|---|---|
| Beamer | `equipment_name` = "Beamer" | event_av_equipment | VARCHAR | Equipment name identifier |
| Beamer (Amount) | `quantity` | event_av_equipment | INT | Number of units available |
| Beamer (Price per unit) | `price_per_unit` | event_av_equipment | DECIMAL(10,2) | Cost per unit |
| Leinwand | `equipment_name` = "Leinwand" | event_av_equipment | VARCHAR | Equipment name identifier |
| Leinwand (Amount) | `quantity` | event_av_equipment | INT | Number of units available |
| Leinwand (Price per unit) | `price_per_unit` | event_av_equipment | DECIMAL(10,2) | Cost per unit |
| Moderationskoffer | `equipment_name` = "Moderationskoffer" | event_av_equipment | VARCHAR | Equipment name identifier |
| Moderationskoffer (Amount) | `quantity` | event_av_equipment | INT | Number of units available |
| Moderationskoffer (Price per unit) | `price_per_unit` | event_av_equipment | DECIMAL(10,2) | Cost per unit |
| Flipchart | `equipment_name` = "Flipchart" | event_av_equipment | VARCHAR | Equipment name identifier |
| Flipchart (Amount) | `quantity` | event_av_equipment | INT | Number of units available |
| Flipchart (Price per unit) | `price_per_unit` | event_av_equipment | DECIMAL(10,2) | Cost per unit |
| Pinnwand | `equipment_name` = "Pinnwand" | event_av_equipment | VARCHAR | Equipment name identifier |
| Pinnwand (Amount) | `quantity` | event_av_equipment | INT | Number of units available |
| Pinnwand (Price per unit) | `price_per_unit` | event_av_equipment | DECIMAL(10,2) | Cost per unit |
| Rednerpult | `equipment_name` = "Rednerpult" | event_av_equipment | VARCHAR | Equipment name identifier |
| Rednerpult (Amount) | `quantity` | event_av_equipment | INT | Number of units available |
| Rednerpult (Price per unit) | `price_per_unit` | event_av_equipment | DECIMAL(10,2) | Cost per unit |
| Bühne/ Bühnenelemente | `equipment_name` = "Bühne/ Bühnenelemente" | event_av_equipment | VARCHAR | Equipment name identifier |
| Bühne/ Bühnenelemente (Amount) | `quantity` | event_av_equipment | INT | Number of units available |
| Bühne/ Bühnenelemente (Price per unit) | `price_per_unit` | event_av_equipment | DECIMAL(10,2) | Cost per unit |
| Beschallungsanlage | `equipment_name` = "Beschallungsanlage" | event_av_equipment | VARCHAR | Equipment name identifier |
| Beschallungsanlage (Amount) | `quantity` | event_av_equipment | INT | Number of units available |
| Beschallungsanlage (Price per unit) | `price_per_unit` | event_av_equipment | DECIMAL(10,2) | Cost per unit |
| Mikrofon | `equipment_name` = "Mikrofon" | event_av_equipment | VARCHAR | Equipment name identifier |
| Mikrofon (Amount) | `quantity` | event_av_equipment | INT | Number of units available |
| Mikrofon (Price per unit) | `price_per_unit` | event_av_equipment | DECIMAL(10,2) | Cost per unit |
| Tanzfläche | `equipment_name` = "Tanzfläche" | event_av_equipment | VARCHAR | Equipment name identifier |
| Tanzfläche (Amount) | `quantity` | event_av_equipment | INT | Number of units available |
| Tanzfläche (Price per unit) | `price_per_unit` | event_av_equipment | DECIMAL(10,2) | Cost per unit |

## 🔧 6. Operational Handling

| German UI Label | Database Field | Table | Type |
|---|---|---|---|
| Arbeiten Sie mit einem Mindestumsatz? | `has_minimum_spent` | event_operations | BOOLEAN |
| Ab wievielen Personen werden Pauschalen angeboten? | `min_participants_package` | event_operations | INT |
| Wie viel Vorlaufzeit ist für Last-Minute-Anfragen erforderlich? | `last_minute_lead_time` | event_operations | VARCHAR |
| Verfügen Sie über einen Lagerraum für Pakete oder Materialien? | `has_storage` | event_operations | BOOLEAN |
| Wie viele Tage im Voraus kann der Gast das Material für seine Veranstaltung senden? | `material_advance_days` | event_operations | INT |
| Kosten für Room Drop | `room_drop_cost` | event_operations | DECIMAL(10,2) |
| Gibt es Kunden, welche ausschließlich durch das Hotel betreut werden? | `hotel_exclusive_clients` | event_operations | BOOLEAN |

## 📝 7. Contracting

| German UI Label | Database Field | Table | Type |
|---|---|---|---|
| Gibt es Kunden mit Rahmenverträgen für Zimmer und/oder Tagungspauschalen? | `contracted_companies` | event_contracting | TEXT |
| Gibt es Anfragen, die generell abgelehnt werden? (z.B. politische Parteien, Black Listed Accounts) | `refused_requests` | event_contracting | TEXT |
| Gibt es Online-Portale / Agenturen, deren Anfragen abgelehnt werden? | `unwanted_marketing_tools` | event_contracting | TEXT |
| Bieten Sie die Tagungsräume in 1. und 2. Option an? | `first_second_option` | event_contracting | BOOLEAN |
| Bieten Sie geteilte Optionen an? | `split_options` | event_contracting | BOOLEAN |
| Wie lange halten Sie die Räume in 1. Option vor? | `option_hold_duration` | event_contracting | VARCHAR |
| Arbeiten Sie mit Overbooking? | `overbooking_policy` | event_contracting | BOOLEAN |
| Musst ab einer bestimmten Umsatzhöhe eine 2.Unterschrift auf den Vertrag? | `second_signature_required` | event_contracting | BOOLEAN |

## 💰 8. Accounting Handling (Handling Buchhaltung)

| German UI Label | Database Field | Table | Type |
|---|---|---|---|
| Wird bei allen Veranstaltungsbuchungen ein Deposit verlangt? | `deposit_needed_event` | event_operations | BOOLEAN |
| Depositregelungen | `deposit_rules_event` | event_operations | TEXT |
| Wer erstellt und versendet die Depositrechnung? | `deposit_invoice_creator` | event_operations | VARCHAR |
| Wird eine Informationsrechnung für den Kunden erstellt? | `informational_invoice_created` | event_operations | BOOLEAN |
| Handling Abschlussrechnung | `final_invoice_handling_event` | event_operations | TEXT |
| Akzeptierte Zahlungsmethoden | `accepted_payment_methods` | event_contracting | TEXT |
| Kommissionsregelung | `commission_rules` | event_contracting | TEXT |

## 📊 Database Tables Overview

| Table Name | Purpose | Primary Key |
|---|---|---|
| `events` | Main event record with contact details | `id` |
| `event_operations` | Operational handling and business rules | `id` |
| `event_technical` | Technical capabilities and equipment | `id` |
| `event_contracting` | Booking and contract policies | `id` |
| `event_av_equipment` | Audio/visual equipment pricing | `id` |

## 🔗 Table Relationships

- All tables are related to the main `events` table via `event_id` foreign key
- Each event can have multiple equipment entries in `event_av_equipment`
- Each event has one record in `event_operations`, `event_technical`, and `event_contracting`

## 📝 Notes

1. **Boolean Fields**: Use `TRUE`/`FALSE` or `1`/`0` in database
2. **Text Fields**: Allow longer content for detailed descriptions
3. **Decimal Fields**: Store monetary values with 2 decimal places
4. **Equipment Table**: Uses composite approach with equipment name + quantities/prices
5. **Foreign Keys**: All tables reference `events.id` via `event_id` column

## 🔍 Usage Examples

### Getting all data for an event:
```sql
SELECT 
  e.contact_name,
  eo.has_minimum_spent,
  et.is_soundproof,
  ec.first_second_option,
  eav.equipment_name,
  eav.quantity,
  eav.price_per_unit
FROM onboarding_events e
LEFT JOIN event_operations eo ON e.id = eo.event_id
LEFT JOIN event_technical et ON e.id = et.event_id  
LEFT JOIN event_contracting ec ON e.id = ec.event_id
LEFT JOIN event_av_equipment eav ON e.id = eav.event_id
WHERE e.id = ?;
```

### Finding events with specific criteria:
```sql
SELECT e.contact_name 
FROM onboarding_events e
JOIN event_operations eo ON e.id = eo.event_id
WHERE eo.has_minimum_spent = TRUE 
AND eo.has_storage = TRUE;
``` 