import { CheckIcon } from "lucide-react";

export function PostView(props: {
  body: string;
  setBody: (v: string) => void;
  theme: string;
  setTheme: (v: string) => void;
  cardRef: React.RefObject<HTMLDivElement | null>;
}) {
  const { body, setBody, theme, setTheme, cardRef } = props;
  return (
    <div className="space-y-4">
      <div className="mt-32 w-full flex items-center justify-center">
        <div
          ref={cardRef}
          style={{ backgroundColor: theme }}
          className="p-10 max-w-150 h-100 w-full md:p-18 shadow-[0px_0px_512px_#bcbcbc5c]"
        >
          <div className="shadow-[0_0_20px_0px_#33333363] h-full rounded-2xl overflow-clip">
            <div className="w-full h-full bg-white flex items-center justify-center">
              <textarea
                placeholder="Type here..."
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="h-[50%] font-medium px-8 text-center outline-0 w-full p-4 md:text-3xl leading-normal resize-none"
              ></textarea>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-wrap mx-auto w-fit rounded-sm md:rounded-full flex p-1 md:shadow-[0px_0px_512px_#bcbcbc5c] md:border gap-2">
        {[
          "#F26721",
          "#098BF6",
          "#3F9772",
          "#A19797",
          "#262626",
          "#FED43E",
          "#5C5AED",
          "#FFADE4",
          "#944A00",
          "#BD0F2C",
          "#FC4FB7",
          "#D4D4D4",
          "#67B2F9",
          "#D54FF3",
        ].map((a) => (
          <div key={a} className="relative">
            {theme === a && (
              <CheckIcon className="absolute -bottom-0.5 -right-0.5 bg-white rounded-full size-4 p-0.5 shadow-3xl border" />
            )}
            <div
              role="button"
              onClick={() => setTheme(a)}
              className={`size-8 transition-colors rounded-full cursor-pointer hover:opacity-75 border-2 ${theme === a ? "border-[#00000012]" : "border-transparent"}`}
              style={{
                backgroundColor: a,
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
