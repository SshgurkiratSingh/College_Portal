import getCurrentUser from "../actions/getCurrentUser";
import ClientOnly from "../components/ClientOnly";
import Container from "../components/container";
import EmptyState from "../components/EmptyState";
import StudentListsClient from "./StudentListsClient";

export const dynamic = "force-dynamic";

export default async function StudentListsPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return (
      <ClientOnly>
        <EmptyState
          title="Unauthorized"
          subtitle="Please login to view your student lists"
        />
      </ClientOnly>
    );
  }

  return (
    <ClientOnly>
      <Container>
        <StudentListsClient currentUser={currentUser} />
      </Container>
    </ClientOnly>
  );
}