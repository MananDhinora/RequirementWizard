import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileTextIcon } from "lucide-react";
import { useDocumentGenerator } from "@/hooks/use-document-generator";

const formSchema = z.object({
  projectTitle: z.string().min(2, "Project title is required").max(100),
  projectDescription: z
    .string()
    .min(10, "Please provide a detailed description")
    .max(5000),
  outputFormat: z.enum(["markdown", "text"]).default("markdown"),
  documentType: z
    .enum(["comprehensive", "concise", "technical", "business"])
    .default("comprehensive"),
});

type FormValues = z.infer<typeof formSchema>;

type ProjectFormProps = {
  onDocumentGenerated: () => void; // Function to trigger refresh
};

export default function ProjectForm({ onDocumentGenerated }: ProjectFormProps) {
  const { generateDocument, isGenerating, resetDocument } =
    useDocumentGenerator();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      projectTitle: "",
      projectDescription: "",
      outputFormat: "markdown",
      documentType: "comprehensive",
    },
  });

  const onSubmit = async (data: FormValues) => {
    const apiKey = sessionStorage.getItem("openai_api_key");
    const model = sessionStorage.getItem("openai_model") || "gpt-3.5-turbo";

    if (!apiKey) {
      console.error("No API key found");
      form.setError("projectTitle", {
        message: "Please set your OpenAI API key first",
      });
      return;
    }

    try {
      await generateDocument({
        apiKey,
        model,
        ...data,
      });

      console.log("Document generation completed");

      // Trigger refresh in parent component after document is generated
      onDocumentGenerated();
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  const handleClear = () => {
    form.reset();
    resetDocument();
  };

  return (
    <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
      <div className="p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          Project Description
        </h2>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="projectTitle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="block text-sm font-medium text-gray-700">
                    Project Title
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="E.g., CRM System, E-commerce Platform, etc."
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="projectDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="block text-sm font-medium text-gray-700">
                    Project Description
                    <span className="text-xs text-gray-500 font-normal ml-1">
                      (Be as detailed as possible)
                    </span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      rows={10}
                      placeholder="Describe your project requirements, goals, target users, key features, constraints, etc."
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex flex-col space-y-20 sm:flex-row sm:space-y-0 sm:space-x-2 sm:justify-between">
              <div className="flex flex-wrap items-center gap-3">
                <div className="bg-gray-100 rounded-md p-1">
                  <span className="text-s text-black font-medium mr-2">
                    Format:
                  </span>
                  <FormField
                    control={form.control}
                    name="outputFormat"
                    render={({ field }) => (
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <SelectTrigger className="bg-transparent border-0 text-sm text-gray-700 focus:ring-0 focus:outline-none w-40">
                          <SelectValue placeholder="Select format" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="markdown">Markdown</SelectItem>
                          <SelectItem value="text">Plain Text</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>

                <div className="bg-gray-100 rounded-md p-1">
                  <span className="text-s text-black font-medium mr-2">
                    Type:
                  </span>
                  <FormField
                    control={form.control}
                    name="documentType"
                    render={({ field }) => (
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <SelectTrigger className="bg-transparent border-0 text-sm text-gray-700 focus:ring-0 focus:outline-none w-40">
                          <SelectValue placeholder="Select document type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="comprehensive">
                            Comprehensive
                          </SelectItem>
                          <SelectItem value="concise">Concise</SelectItem>
                          <SelectItem value="technical">Technical</SelectItem>
                          <SelectItem value="business">
                            Business-focused
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              </div>

              <div className="flex space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClear}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Clear
                </Button>

                <Button
                  type="submit"
                  disabled={isGenerating}
                  className="inline-flex items-center px-5 py-2 border text-base font-medium rounded-md shadow-sm text-black bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  {isGenerating ? (
                    <span className="flex items-center">
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Generating...
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <FileTextIcon className="mr-2 h-5 w-5" />
                      Generate PRD
                    </span>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
