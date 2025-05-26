import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const eventSchema = z.object({
  name: z.string().min(1, "Nazwa jest wymagana"),
  duration: z.number().min(1, "Czas musi być większy od 0"),
  predecessors: z.string().optional(),
});

type EventFormData = z.infer<typeof eventSchema>;

interface EventFormProps {
  onAddEvent: (event: EventFormData) => void;
  onGenerateGraph: () => void;
}

export default function EventForm({ onAddEvent, onGenerateGraph }: EventFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
  });

  const onSubmit = (data: EventFormData) => {
    onAddEvent(data);
    reset();
  };

  return (
    <div className="flex flex-col items-center">
    <form onSubmit={handleSubmit(onSubmit)} className="p-4 bg-blue-100 dark:bg-red-600 rounded-lg shadow-md w-full">
      <label className="block mb-2">
        Nazwa zdarzenia:
        <input
          type="text"
          {...register("name")}
          className="block w-full p-2 border rounded-md"
        />
        {errors.name && <p className="text-red-500 dark:text-yellow-500">{errors.name.message}</p>}
      </label>

      <label className="block mb-2">
        Czas wykonania (w dniach):
        <input
          type="number"
          {...register("duration", { valueAsNumber: true })}
          className="block w-full p-2 border rounded-md"
        />
        {errors.duration && <p className="text-red-500 dark:text-yellow-500">{errors.duration.message}</p>}
      </label>

      <label className="block mb-4">
        Poprzednicy (oddzielone przecinkami, jeżeli początkowe to zostawić puste pole):
        <input
          type="text"
          {...register("predecessors")}
          className="block w-full p-2 border rounded-md"
        />
      </label>

      <button type="submit" className="hover:bg-blue-700 dark:hover:bg-yellow-400 bg-blue-500 dark:bg-yellow-300 text-white dark:text-black px-4 py-2 rounded-md">
        Dodaj zdarzenie
      </button>
    </form>
    <button onClick={onGenerateGraph} className="hover:bg-blue-700 ml-3 mt-2 dark:hover:bg-yellow-400 bg-blue-500 dark:bg-yellow-300 text-white dark:text-black px-4 py-2 rounded-md">
      Generuj graf
    </button>
    </div>
  );
}
