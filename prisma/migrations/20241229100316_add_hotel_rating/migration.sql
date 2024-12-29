-- AlterTable
ALTER TABLE "Hotel" ADD COLUMN     "rating" DECIMAL(2,1) NOT NULL DEFAULT 1.0;

-- Add check constraint to ensure rating is between 1 and 5 with step 0.5
ALTER TABLE "Hotel" ADD CONSTRAINT "rating_check"
  CHECK (
    rating >= 1.0 AND
    rating <= 5.0 AND
    (rating * 10) % 5 = 0
  );