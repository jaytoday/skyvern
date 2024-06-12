import { getClient } from "@/api/AxiosClient";
import { Status, TaskApiResponse } from "@/api/types";
import { StatusBadge } from "@/components/StatusBadge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useCredentialGetter } from "@/hooks/useCredentialGetter";
import { cn } from "@/util/utils";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { NavLink, Outlet, useParams } from "react-router-dom";

function TaskDetails() {
  const { taskId } = useParams();
  const credentialGetter = useCredentialGetter();

  const {
    data: task,
    isFetching: taskIsFetching,
    isError: taskIsError,
    error: taskError,
  } = useQuery<TaskApiResponse>({
    queryKey: ["task", taskId, "details"],
    queryFn: async () => {
      const client = await getClient(credentialGetter);
      return client.get(`/tasks/${taskId}`).then((response) => response.data);
    },
    refetchInterval: (query) => {
      if (
        query.state.data?.status === Status.Running ||
        query.state.data?.status === Status.Queued
      ) {
        return 30000;
      }
      return false;
    },
    placeholderData: keepPreviousData,
  });

  if (taskIsError) {
    return <div>Error: {taskError?.message}</div>;
  }

  const showExtractedInformation =
    task?.status === Status.Completed && task.extracted_information !== null;
  const extractedInformation = showExtractedInformation ? (
    <div className="flex items-center">
      <Label className="w-32 shrink-0 text-lg">Extracted Information</Label>
      <Textarea
        rows={5}
        value={JSON.stringify(task.extracted_information, null, 2)}
        readOnly
      />
    </div>
  ) : null;

  const showFailureReason =
    task?.status === Status.Failed ||
    task?.status === Status.Terminated ||
    task?.status === Status.TimedOut;
  const failureReason = showFailureReason ? (
    <div className="flex items-center">
      <Label className="w-32 shrink-0 text-lg">Failure Reason</Label>
      <Textarea
        rows={5}
        value={JSON.stringify(task.failure_reason, null, 2)}
        readOnly
      />
    </div>
  ) : null;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center gap-4">
        <Input value={taskId} className="w-52" readOnly />
        {taskIsFetching ? (
          <Skeleton className="w-28 h-8" />
        ) : task ? (
          <StatusBadge status={task?.status} />
        ) : null}
      </div>
      {taskIsFetching ? (
        <div className="flex items-center gap-2">
          <Skeleton className="w-32 h-32" />
          <Skeleton className="w-full h-32" />
        </div>
      ) : (
        <>
          {extractedInformation}
          {failureReason}
        </>
      )}
      <div className="flex justify-center items-center">
        <div className="inline-flex border rounded bg-muted p-1">
          <NavLink
            to="actions"
            className={({ isActive }) => {
              return cn(
                "cursor-pointer px-2 py-1 rounded-md text-muted-foreground",
                {
                  "bg-primary-foreground text-foreground": isActive,
                },
              );
            }}
          >
            Actions
          </NavLink>
          <NavLink
            to="recording"
            className={({ isActive }) => {
              return cn(
                "cursor-pointer px-2 py-1 rounded-md text-muted-foreground",
                {
                  "bg-primary-foreground text-foreground": isActive,
                },
              );
            }}
          >
            Recording
          </NavLink>
          <NavLink
            to="parameters"
            className={({ isActive }) => {
              return cn(
                "cursor-pointer px-2 py-1 rounded-md text-muted-foreground",
                {
                  "bg-primary-foreground text-foreground": isActive,
                },
              );
            }}
          >
            Parameters
          </NavLink>
          <NavLink
            to="diagnostics"
            className={({ isActive }) => {
              return cn(
                "cursor-pointer px-2 py-1 rounded-md text-muted-foreground",
                {
                  "bg-primary-foreground text-foreground": isActive,
                },
              );
            }}
          >
            Diagnostics
          </NavLink>
        </div>
      </div>
      <Outlet />
    </div>
  );
}

export { TaskDetails };
