/**
 * v0 by Vercel.
 * @see https://v0.dev/t/NXzBPtQmYoJ
 * Documentation: https://v0.dev/docs#integrating-generated-code-into-your-nextjs-app
 */
import { Button } from "@/components/ui/button";

type JobProps = {
  title: string;
  short_descr: string;
  location: string;
  company: string;
};

type JobListProps = {
    jobs: JobProps[];
}

export default function JobList({ jobs }: JobListProps) {
  return (
    <>
      {jobs.map((j, idx) => (
        <div
          className="flex flex-col gap-2 w-full max-w-2xl mx-auto p-2"
          key={idx}
        >
          <div className="flex flex-col bg-white shadow-md rounded-lg p-6 dark:bg-gray-800">
            <h2 className="text-xl font-bold">{j.title} </h2>
            <h3 className="text-lg text-gray-500 dark:text-gray-400">
              {j.company}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {j.location}
            </p>
            <p className="text-sm mt-2">{j.short_descr}</p>
            <Button className="mt-4">Apply Now</Button>
          </div>
        </div>
      ))}
    </>
  );
}
