import { useState, useEffect } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dish,
  Ingredient,
  Recipe,
  RecipeIngredient,
} from "@/types/database.types";
import {
  createRecipe,
  updateRecipe,
  addIngredientToRecipe,
  updateRecipeIngredient,
  removeIngredientFromRecipe,
} from "@/lib/api";
import { toast } from "sonner";

// Define the schema for form validation
const recipeFormSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Recipe name must be at least 2 characters" }),
  dishId: z.string().uuid({ message: "Please select a dish" }),
  instructions: z.string().optional(),
  category: z.string().optional(),
  allergens: z
    .string()
    .optional()
    .transform((val) => (val ? val.split(",").map((a) => a.trim()) : [])),
  ingredients: z.array(
    z.object({
      id: z.string().optional(),
      ingredientId: z.string().uuid({ message: "Please select an ingredient" }),
      quantity: z.coerce
        .number()
        .positive({ message: "Quantity must be positive" }),
      unit: z.string().min(1, { message: "Unit is required" }),
    })
  ),
});

type RecipeFormValues = z.infer<typeof recipeFormSchema>;

interface RecipeFormProps {
  recipe?: Recipe & { recipe_ingredients?: RecipeIngredient[] };
  dishes: Dish[];
  ingredients: Ingredient[];
  onSuccess?: () => void;
}

export function RecipeForm({
  recipe,
  dishes,
  ingredients,
  onSuccess,
}: RecipeFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize the form with default values or existing recipe data
  const form = useForm<RecipeFormValues>({
    resolver: zodResolver(recipeFormSchema),
    defaultValues: recipe
      ? {
          name: recipe.name,
          dishId: recipe.dish_id,
          instructions: recipe.instructions || "",
          category: recipe.category || "",
          allergens: recipe.allergens ? recipe.allergens.join(", ") : "",
          ingredients:
            recipe.recipe_ingredients?.map((ri) => ({
              id: ri.id,
              ingredientId: ri.ingredient_id,
              quantity: ri.quantity,
              unit: ri.unit,
            })) || [],
        }
      : {
          name: "",
          dishId: "",
          instructions: "",
          category: "",
          allergens: "",
          ingredients: [{ ingredientId: "", quantity: 1, unit: "" }],
        },
  });

  // Setup field array for ingredients
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "ingredients",
  });

  // Handle form submission
  const onSubmit = async (data: RecipeFormValues) => {
    try {
      setIsSubmitting(true);

      let recipeId = recipe?.id;

      if (!recipeId) {
        // Create a new recipe
        const newRecipe = await createRecipe({
          name: data.name,
          dish_id: data.dishId,
          instructions: data.instructions,
          category: data.category,
          allergens: data.allergens as string[],
          user_id: "current-user-id", // Replace with actual user ID
        });
        recipeId = newRecipe.id;
      } else {
        // Update existing recipe
        await updateRecipe(recipeId, {
          name: data.name,
          dish_id: data.dishId,
          instructions: data.instructions,
          category: data.category,
          allergens: data.allergens as string[],
        });
      }

      // Process ingredients
      for (const ingredientData of data.ingredients) {
        if (ingredientData.id) {
          // Update existing recipe ingredient
          await updateRecipeIngredient(ingredientData.id, {
            ingredient_id: ingredientData.ingredientId,
            quantity: ingredientData.quantity,
            unit: ingredientData.unit,
          });
        } else {
          // Add new ingredient to recipe
          await addIngredientToRecipe({
            recipe_id: recipeId,
            ingredient_id: ingredientData.ingredientId,
            quantity: ingredientData.quantity,
            unit: ingredientData.unit,
          });
        }
      }

      // Handle ingredient removal
      const currentIngredientIds = data.ingredients
        .filter((ing) => ing.id)
        .map((ing) => ing.id);

      const ingredientsToRemove =
        recipe?.recipe_ingredients?.filter(
          (ri) => !currentIngredientIds.includes(ri.id)
        ) || [];

      for (const ing of ingredientsToRemove) {
        await removeIngredientFromRecipe(ing.id);
      }

      toast.success(
        recipe ? "Recipe updated successfully" : "Recipe created successfully"
      );

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error saving recipe:", error);
      toast.error("Failed to save recipe");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>{recipe ? "Edit Recipe" : "Create New Recipe"}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Recipe Basic Info */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Recipe Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Recipe name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dishId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dish</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a dish" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {dishes.map((dish) => (
                          <SelectItem key={dish.id} value={dish.id}>
                            {dish.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Appetizer, Entre, Dessert"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="allergens"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Allergens</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Nuts, Dairy, Gluten"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Separate allergens with commas
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="instructions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Instructions</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Preparation instructions..."
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Ingredients Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Ingredients</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    append({ ingredientId: "", quantity: 1, unit: "" })
                  }
                >
                  Add Ingredient
                </Button>
              </div>

              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="grid grid-cols-12 gap-2 items-start"
                >
                  <div className="col-span-6 md:col-span-5">
                    <FormField
                      control={form.control}
                      name={`ingredients.${index}.ingredientId`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className={index !== 0 ? "sr-only" : ""}>
                            Ingredient
                          </FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select ingredient" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {ingredients.map((ingredient) => (
                                <SelectItem
                                  key={ingredient.id}
                                  value={ingredient.id}
                                >
                                  {ingredient.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="col-span-3 md:col-span-3">
                    <FormField
                      control={form.control}
                      name={`ingredients.${index}.quantity`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className={index !== 0 ? "sr-only" : ""}>
                            Quantity
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="col-span-3 md:col-span-3">
                    <FormField
                      control={form.control}
                      name={`ingredients.${index}.unit`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className={index !== 0 ? "sr-only" : ""}>
                            Unit
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., g, ml, pcs" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex items-end h-full col-span-12 md:col-span-1 justify-end md:justify-center">
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => remove(index)}
                        className="h-10 w-10 rounded-full p-0"
                      >
                        <span className="sr-only">Remove ingredient</span>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="size-4"
                        >
                          <path d="M3 6h18" />
                          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                          <line x1="10" y1="11" x2="10" y2="17" />
                          <line x1="14" y1="11" x2="14" y2="17" />
                        </svg>
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <CardFooter className="px-0 pt-4">
              <Button type="submit" disabled={isSubmitting} className="ml-auto">
                {isSubmitting
                  ? "Saving..."
                  : recipe
                  ? "Update Recipe"
                  : "Create Recipe"}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
