/**
 * formOptions — static dropdown options for Step 1 Details.
 * Content type options differ slightly by request type per the spec.
 */
export const CONTENT_TYPE_OPTIONS_BY_FLOW = {
  vizId: [
    { value: "enhanced_content", label: "Enhanced Content" },
    { value: "a_plus", label: "A+ Content" },
    { value: "lifestyle_images", label: "Lifestyle Images" },
    { value: "video", label: "Video" },
  ],
  brandRequest: [
    { value: "enhanced_content", label: "Enhanced Content" },
    { value: "a_plus", label: "A+ Content" },
    { value: "brand_store", label: "Brand Store Update" },
    { value: "video", label: "Video" },
  ],
  innovation: [
    { value: "new_item_setup", label: "New Item Setup" },
    { value: "enhanced_content", label: "Enhanced Content" },
    { value: "a_plus", label: "A+ Content" },
  ],
};

export const mockAssignees = [
  { value: "priya.nair", label: "Priya Nair" },
  { value: "diego.alvarez", label: "Diego Alvarez" },
  { value: "mariana.perez", label: "Mariana Perez" },
  { value: "jordan.lee", label: "Jordan Lee" },
];

export const REQUEST_TYPE_LABELS = {
  vizId: "Viz ID Change",
  brandRequest: "Brand Request",
  innovation: "Innovation",
};

export const DATE_FIELD_LABEL_BY_FLOW = {
  vizId: "Default Launch Date",
  brandRequest: "Due/Launch Date",
  innovation: "Default On Sale Date",
};
