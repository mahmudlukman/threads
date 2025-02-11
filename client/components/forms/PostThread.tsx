import { useState } from "react";
import * as z from "zod";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useCreateThreadMutation } from "@/redux/features/thread/threadApi";

// Update this validation schema to match your API
const ThreadValidation = z.object({
  text: z.string().min(1, "Thread content is required"),
  image: z.string().optional(),
});

interface Props {
  userId: string;
  communityId?: string;
}

const PostThread = ({ communityId }: Props) => {
  const router = useRouter();
  const [createThread, { isLoading }] = useCreateThreadMutation();
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const form = useForm<z.infer<typeof ThreadValidation>>({
    resolver: zodResolver(ThreadValidation),
    defaultValues: {
      text: "",
      image: "",
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      const file = files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        form.setValue("image", result);
        setImagePreview(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    form.setValue("image", "");
    setImagePreview(null);
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const onSubmit = async (values: z.infer<typeof ThreadValidation>) => {
    try {
      console.log("Submitting values:", values); // Debug log
      
      const response = await createThread({
        text: values.text, // Changed from thread to text
        image: values.image,
        communityId,
      }).unwrap();
      
      console.log("Response:", response); // Debug log

      router.push("/");
      form.reset();
      setImagePreview(null);
    } catch (error) {
      console.error("Failed to create thread:", error);
    }
  };

  return (
    <Form {...form}>
      <form
        className="mt-10 flex flex-col justify-start gap-6"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <FormField
          control={form.control}
          name="text" // Changed from thread to text
          render={({ field }) => (
            <FormItem className="flex w-full flex-col gap-3">
              <FormLabel className="text-base-semibold text-light-2">
                Content
              </FormLabel>
              <FormControl className="no-focus border border-dark-4 bg-dark-3 text-light-1">
                <Textarea rows={8} {...field} disabled={isLoading} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="image"
          render={({ field }) => (
            <FormItem className="flex w-full flex-col gap-3">
              <div className="flex items-center gap-4">
                <FormControl className="w-40">
                  <Input
                    type="file"
                    accept="image/*"
                    placeholder="Add image"
                    className="bg-dark-3 text-light-1 text-sm"
                    onChange={handleImageChange}
                    disabled={isLoading}
                  />
                </FormControl>
              </div>
              {imagePreview && (
                <div className="mt-4 flex flex-col items-center gap-4">
                  <div className="relative">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute -right-2 -top-2 h-6 w-6 rounded-full bg-red-500 p-1 hover:bg-red-600"
                      onClick={handleRemoveImage}
                    >
                      <X className="h-4 w-4 text-white" />
                    </Button>
                    <Image
                      src={imagePreview}
                      alt="thread image"
                      width={400}
                      height={300}
                      priority
                      className="rounded-lg object-cover max-h-[300px]"
                    />
                  </div>
                </div>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="bg-primary-500" disabled={isLoading}>
          {isLoading ? "Posting..." : "Post Thread"}
        </Button>
      </form>
    </Form>
  );
};

export default PostThread;