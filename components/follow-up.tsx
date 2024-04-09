'use client'

import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Textarea } from "./ui/textarea";

export function FollowUp({ setSystemFollowUp, systemFollowUp }: { setSystemFollowUp: (value: string) => void, systemFollowUp: string}){
  return (
    <fieldset className="grid gap-6 rounded-lg border p-4">
      <legend className="-ml-1 px-1 text-sm font-medium">
        Follow-up question
      </legend>
      <div className="grid gap-3">
        <Label htmlFor="role">Role</Label>
        <Select defaultValue="system">
          <SelectTrigger disabled>
            <SelectValue placeholder="Select a role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="system">System</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-3">
        <Label htmlFor="content">Content</Label>
        <Textarea
          id="content"
          placeholder="You are a..."
          className="min-h-[9.5rem]"
          onChange={(e) => setSystemFollowUp(e.target.value)}
          value={systemFollowUp}
        />
      </div>
    </fieldset>
  );
}
