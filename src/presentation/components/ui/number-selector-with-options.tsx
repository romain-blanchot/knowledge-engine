import { Minus, Plus } from "lucide-react";
import { Button } from "./button";
import { Input } from "./input";
import { useFormContext } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "./form";

interface NumberSelectorWithOptionsProps {
  nameInForm: string;
  label: string;
  min?: number;
  max?: number;
  quickOptionsCount?: number;
  required?: boolean;
  unitLabel?: string;
}

export function NumberSelectorWithOptions({
  nameInForm,
  label,
  min = 1,
  max = 60,
  quickOptionsCount = 10,
  required = true,
  unitLabel = "",
}: NumberSelectorWithOptionsProps) {
  const { control } = useFormContext();

  return (
    <FormField
      control={control}
      name={nameInForm}
      render={({ field }) => {
        const value = field.value ?? 0;
        // const value = field.value ?? min;
        const handleSet = (newValue: number) => {
          if (newValue >= min && newValue <= max) {
            field.onChange(newValue);
          }
        };

        return (
          <FormItem className="flex flex-col gap-2">
            <FormLabel className="flex items-center gap-1">
              {label}
              {required && <span className="font-bold text-lg text-primary-text">*</span>}
            </FormLabel>
            <FormControl>
              <div className="flex flex-col gap-4">
                <div className="flex flex-wrap gap-2 justify-center">
                  {Array.from({ length: quickOptionsCount }, (_, i) => i + min).map((val) => (
                    <Button
                      key={val}
                      type="button"
                      variant={val === value ? "default" : "secondary"}
                      size="icon"
                      onClick={() => handleSet(val)}
                      data-testid={`quick-option-${val}`}
                      className={`w-14 h-14 text-lg md:w-12 md:h-12  cursor-pointer border-2 border-secondary-lighter hover:border-primary ${
                        val === value
                          ? "bg-primary text-white"
                          : "hover:text-primary text-secondary-text"
                      }`}
                    >
                      {val}
                    </Button>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    className="w-12 h-12 md:w-10 md:h-10 cursor-pointer"
                    variant="outline"
                    size="icon"
                    onClick={() => handleSet(value - 1)}
                  >
                    <Minus />
                  </Button>
                  <Input
                    type="number"
                    className="text-center font-semibold h-12 md:h-10 text-xl"
                    value={value}
                    onChange={(e) => handleSet(Number(e.target.value))}
                    min={min}
                    max={max}
                    onBlur={field.onBlur}
                  />
                  <Button
                    className="w-12 h-12 md:w-10 md:h-10 cursor-pointer"
                    variant="outline"
                    size="icon"
                    onClick={() => handleSet(value + 1)}
                  >
                    <Plus />
                  </Button>
                  {unitLabel && <span className="text-sm text-primary-text">{unitLabel}</span>}
                </div>
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}
