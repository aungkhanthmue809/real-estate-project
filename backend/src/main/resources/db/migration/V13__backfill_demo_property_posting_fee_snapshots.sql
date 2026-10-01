-- Backfill legacy/demo listings from the currently configured posting-fee schedule.
-- These snapshots support demonstration analytics and must not be interpreted as
-- evidence that any historical payment was collected.
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM properties p
        LEFT JOIN property_posting_fees f
            ON f.property_type = p.property_type
        WHERE p.posting_fee_at_submission IS NULL
          AND f.property_type IS NULL
    ) THEN
        RAISE EXCEPTION 'Cannot backfill posting-fee snapshots: an unmapped property type exists';
    END IF;
END
$$;

UPDATE properties p
SET posting_fee_at_submission = f.fee_amount
FROM property_posting_fees f
WHERE p.posting_fee_at_submission IS NULL
  AND p.property_type = f.property_type;
