/**
 * v0 by Vercel.
 * @see https://v0.dev/t/NXzBPtQmYoJ
 * Documentation: https://v0.dev/docs#integrating-generated-code-into-your-nextjs-app
 */
'use client'
import { useActions } from "ai/rsc";
import { AI } from "@/app/action";
import { useState } from "react";
import JobWithCompanyInfo from "./job-with-company-info";

export type JobProps = {
  title: string;
  short_descr: string;
  geo: {
    city: string;
  };
  company: string;
  url: string;
};

type JobListProps = {
    jobs: JobProps[];
}

export default function JobList({ jobs }: JobListProps) {
  return (
    <>
      {jobs.map((j, idx) => (
        <JobWithCompanyInfo j={j} idx={idx} key={idx} />
      ))}
    </>
  );
}
