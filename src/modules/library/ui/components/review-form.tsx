import { toast } from "@/components/custom-toast";
import StarPicker from "@/components/star-picker";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { ReviewGetOneOutput } from "@/modules/reviews/types";
import { useTRPC } from "@/trpc/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";

interface Props {
  productId: string;
  initialData?: ReviewGetOneOutput;
}

const formSchema = z.object({
  rating: z.number().min(1, { message: "Rating is required" }).max(5),
  description: z.string().min(1, { message: "Description is required" }),
});

const ReviewForm = ({ productId, initialData }: Props) => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const [isPreview, setIsPreview] = useState(!!initialData);

  const createReview = useMutation(
    trpc.reviews.create.mutationOptions({
      onSuccess: (data) => {
        queryClient.invalidateQueries(
          trpc.reviews.getOne.queryOptions({ productId })
        );
        setIsPreview(true);
      },
      onError: (error) => {
        console.error("Error creating review:", error);
        toast.error(error.message);
      },
    })
  );

  const updateReview = useMutation(
    trpc.reviews.update.mutationOptions({
      onSuccess: (data) => {
        queryClient.invalidateQueries(
          trpc.reviews.getOne.queryOptions({ productId })
        );
        setIsPreview(true);
      },
      onError: (error) => {
        console.error("Error creating review:", error);
        toast.error(error.message);
      },
    })
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      rating: initialData?.rating ?? 0,
      description: initialData?.description ?? "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    console.log(values);

    if (initialData) {
      updateReview.mutate({
        reviewId: initialData.id,
        rating: values.rating,
        description: values.description,
      });
    } else {
      createReview.mutate({
        productId,
        rating: values.rating,
        description: values.description,
      });
    }
  };

  return (
    <Form {...form}>
      <form
        className="flex flex-col gap-y-4"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <p className="font-medium">
          {isPreview ? "Your rating" : "Liked it? Give it a rating"}
        </p>

        <FormField
          control={form.control}
          name="rating"
          render={({ field }) => {
            return (
              <FormItem>
                <FormControl>
                  <StarPicker
                    disabled={isPreview}
                    value={field.value}
                    onChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            );
          }}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => {
            return (
              <FormItem>
                <FormControl>
                  <Textarea
                    placeholder="Want to leave a written review?"
                    disabled={isPreview}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            );
          }}
        />

        {!isPreview && (
          <Button
            type="submit"
            variant="elevated"
            size="lg"
            disabled={createReview.isPending || updateReview.isPending}
            className="w-fit bg-black text-white hover:bg-feature hover:text-primary"
          >
            {initialData ? "Update review" : "Post review"}
          </Button>
        )}
      </form>

      {isPreview && (
        <Button
          type="button"
          variant="elevated"
          size="lg"
          className="w-fit mt-4"
          onClick={() => setIsPreview(false)}
        >
          Edit
        </Button>
      )}
    </Form>
  );
};

export const ReviewFormSkeleton = () => {
  return (
    <div className="flex flex-col gap-y-4">
      <p className="font-medium">Liked it? Give it a rating</p>
      <StarPicker disabled />
      <Textarea placeholder="Want to leave a written review?" disabled />
      <Button
        type="button"
        variant="elevated"
        size="lg"
        disabled
        className="w-fit bg-black text-white hover:bg-feature hover:text-primary"
      >
        Post review
      </Button>
    </div>
  );
};

export default ReviewForm;
