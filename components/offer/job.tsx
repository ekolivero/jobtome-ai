import { Button } from "../ui/button";

export type JobProps = {
  title: string;
  short_descr: string;
  geo: {
    city: string;
  };
  company: string;
};

type JobListProps = {
  jobs: JobProps[];
};

export default function Job({ j }: { j: JobProps} ) {
    return (
      <div className="flex flex-col bg-white rounded-lg p-6 dark:bg-gray-800 md:hidden">
        <h2 className="text-xl font-bold">{j.title} </h2>
        <h3 className="text-lg text-gray-500 dark:text-gray-400">
          {j.company}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">{j.geo.city}</p>
        <Button variant={"outline"} className="mt-4 text-xs">
          Apply Now
        </Button>
      </div>
    );
}