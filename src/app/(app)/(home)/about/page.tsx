const AboutPage = () => {
  return <div>HELLO WORLD</div>;
};

export default AboutPage;

// "use client";

// import { Button } from "@/components/ui/button";
// import { useTRPC } from "@/trpc/client";
// import { useInfiniteQuery, useMutation, useQuery } from "@tanstack/react-query";
// import { id } from "date-fns/locale";
// import React from "react";

// const AboutPage = () => {
//   const trpc = useTRPC();

//   const { data: launchpads } = useQuery(
//     trpc.launchpads.getMany.queryOptions({})
//   );
//   // const { data: launchpadDetail } = useQuery(
//   //   trpc.launchpads.getOne.queryOptions({ id: "688d252fdd7e76a5746a43b9" })
//   // );

//   // Tenant actions
//   const createLp = useMutation(trpc.launchpads.create.mutationOptions({}));
//   const updateLp = useMutation(trpc.launchpads.update.mutationOptions({}));
//   const deleteLp = useMutation(trpc.launchpads.delete.mutationOptions({}));
//   const submitForApprovalLp = useMutation(
//     trpc.launchpads.submitForApproval.mutationOptions({})
//   );
//   const publishLp = useMutation(trpc.launchpads.publish.mutationOptions({}));

//   // Admin actions
//   const approveLp = useMutation(trpc.launchpads.approve.mutationOptions({}));
//   const rejectLp = useMutation(trpc.launchpads.reject.mutationOptions({}));

//   // User actions
//   const purchaseLp = useMutation(trpc.launchpads.purchase.mutationOptions({}));

//   console.log("Launchpads:", launchpads);
//   // console.log("launchpadDetail:", launchpadDetail);

//   // functions
//   const createLaunchpad = async () => {
//     const test = {
//       tags: ["688d13d5046fe99b4ef2006c"],
//       title: "New Launchpadd",
//       image: "688d18de3e55d079b728d6f4",
//       status: "draft",
//       content: {
//         root: {
//           children: [
//             {
//               children: [
//                 {
//                   detail: 0,
//                   format: 0,
//                   mode: "normal",
//                   style: "",
//                   text: "content nhaa",
//                   type: "text",
//                   version: 1,
//                 },
//               ],
//               direction: "ltr",
//               format: "",
//               indent: 0,
//               type: "paragraph",
//               version: 1,
//               textFormat: 0,
//               textStyle: "",
//             },
//           ],
//           direction: "ltr",
//           format: "",
//           indent: 0,
//           type: "root",
//           version: 1,
//         },
//       },
//       duration: 3,
//       priority: 0,
//       category: "688d13ce046fe99b4ef1ffc1",
//       soldCount: 0,
//       description: "Description of the new launchpadd",
//       launchPrice: 5,
//       originalPrice: 15,
//     };
//     const response = await createLp.mutateAsync({
//       tags: ["688d13d5046fe99b4ef20068", "688d13d5046fe99b4ef2006a"],
//       title: "New Launchpad",
//       image:
//         "https://images.unsplash.com/photo-1620336655052-b57986f5a26a?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
//       // status: "draft",
//       duration: 1,
//       // priority: 0,
//       category: "688d13ce046fe99b4ef1ffbf",
//       // soldCount: 0,
//       description: "Description of the new launchpad",
//       launchPrice: 50,
//       originalPrice: 150,
//     });
//     console.log("response create launchpad: ", response);
//   };

//   const updateLaunchpad = async () => {
//     const response = await updateLp.mutateAsync({
//       id: "launchpad-id",
//       title: "Updated Launchpad",
//       description: "Description of the updated launchpad",
//       launchPrice: 120,
//       category: "688d13cf046fe99b4ef1ffdc",
//       tags: ["688d13d5046fe99b4ef20068"],
//       // content: "<p>Rich text content</p>",
//       image:
//         "https://images.unsplash.com/photo-1620336655052-b57986f5a26a?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
//       originalPrice: 150,
//       duration: 2,
//       // refundPolicy: "<p>Refund policy details</p>",
//     });
//     console.log("response update launchpad: ", response);
//   };

//   const deleteLaunchpad = async () => {
//     const response = await deleteLp.mutateAsync({
//       id: "launchpad-id",
//     });
//     console.log("response delete launchpad: ", response);
//   };

//   const submitForApprovalLaunchpad = async () => {
//     const response = await submitForApprovalLp.mutateAsync({
//       id: "688d23d0dd7e76a5746a4310",
//     });
//     console.log("response submit for approval launchpad: ", response);
//   };

//   const publishLaunchpad = async () => {
//     const response = await publishLp.mutateAsync({
//       id: "688d23d0dd7e76a5746a4310",
//     });
//     console.log("response publish launchpad: ", response);
//   };

//   const approveLaunchpad = async () => {
//     const response = await approveLp.mutateAsync({
//       id: "688d23d0dd7e76a5746a4310",
//       priority: 1,
//     });
//     console.log("response approve launchpad: ", response);
//   };

//   const rejectLaunchpad = async () => {
//     const response = await rejectLp.mutateAsync({
//       id: "688d23d0dd7e76a5746a4310",
//       reason: "Not meeting quality standards",
//     });
//     console.log("response reject launchpad: ", response);
//   };

//   const purchaseLaunchpad = async () => {
//     const response = await purchaseLp.mutateAsync({
//       launchpadId: "688d23d0dd7e76a5746a4310",
//     });
//     console.log("response purchase launchpad: ", response);
//   };

//   const testExpiredLaunchpad = async () => {
//     // Tạo launchpad với duration 0.01 giờ (36 giây)
//     const response = await createLp.mutateAsync({
//       // tags: ["688df93ebf5671975783a486"],
//       title: "test lp expired",
//       description: "test lp expired description",
//       image: "688e0256572cc823658c5e8a",
//       launchPrice: 5,
//       originalPrice: 10,
//       duration: 0.01,
//       category: "688e00f4ee2160b6c7e20f2e",
//       refundPolicy: "30-day",
//     });

//     console.log("Test launchpad created:", response);
//   };

//   return (
//     <div className="flex flex-col items-center justify-center p-4">
//       <Button variant="default" onClick={testExpiredLaunchpad}>
//         Create Test Expired Launchpad
//       </Button>
//       <Button variant="default" onClick={createLaunchpad}>
//         Create Launchpad
//       </Button>
//       <Button variant="default" onClick={updateLaunchpad}>
//         Update Launchpad
//       </Button>
//       <Button variant="default" onClick={deleteLaunchpad}>
//         Delete Launchpad
//       </Button>
//       <Button variant="default" onClick={submitForApprovalLaunchpad}>
//         Submit for Approval Launchpad
//       </Button>
//       <Button variant="default" onClick={publishLaunchpad}>
//         Publish Launchpad
//       </Button>
//       <Button variant="default" onClick={approveLaunchpad}>
//         Approve Launchpad
//       </Button>
//       <Button variant="default" onClick={rejectLaunchpad}>
//         Reject Launchpad
//       </Button>
//       <Button variant="default" onClick={purchaseLaunchpad}>
//         Purchase Launchpad
//       </Button>
//     </div>
//   );
// };

// export default AboutPage;
