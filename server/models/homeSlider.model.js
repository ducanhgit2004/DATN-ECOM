import mongoose from "mongoose";

const homeSliderSchema = mongoose.Schema(
  {
    image: { type: String, required: true, trim: true },
    title: { type: String, trim: true, default: "" },
    link: { type: String, trim: true, default: "" },
    order: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true },
);

const HomeSliderModel = mongoose.model("HomeSlider", homeSliderSchema);

export default HomeSliderModel;
