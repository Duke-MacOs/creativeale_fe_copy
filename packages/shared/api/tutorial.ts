import Axios from 'axios';

export interface ITutorial {
  projectId: number;
  tutorialUrl: string;
  _id: string;
  createAt: string;
  updateAt: string;
}
const requestUrl = 'https://magicplay.oceanengine.com/static-cloud/invoke/project_tutorial_relation';
class TutorialService {
  async getAllTutorials() {
    const { data } = await Axios.get(requestUrl);
    return data as ITutorial[];
  }
  async deleteTutorial(id: number) {
    await Axios.delete(requestUrl, {
      data: { projectId: id },
    });
  }
  async postTutorial(id: number, tutorialUrl: string | undefined): Promise<ITutorial> {
    const { data } = await Axios.post(requestUrl, {
      tutorialUrl,
      projectId: id,
    });
    return data;
  }
}

export const tutorialService = new TutorialService();
